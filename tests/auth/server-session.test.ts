import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { QueryClient, QueryObserver } from "@tanstack/react-query";

import { getAuthAccess } from "../../src/common/auth/access";
import type { AuthUser } from "../../src/common/auth/types";
import type { AuthSession } from "../../src/common/auth/types";
import { recoverServerSession } from "../../src/common/auth/recover-server-session";
import { changeAuthSession } from "../../src/common/api/auth-session";

process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
const sessionModule = import("../../src/common/auth/request-session.api");
const fetchRequestSession = async (token: string | undefined) => (await sessionModule).fetchRequestSession(token);
const customer: AuthUser = {
  id: "server-customer", name: "테스트", email: "server@example.com", phone: null,
  role: "CUSTOMER", profileCompleted: true,
};
afterEach(() => mock.restoreAll());

// Next 요청 경계 밖에서 HTTP 전송·응답 판정을 검증합니다. 실제 cookies()는 Next 런타임 검증이 별도로 필요합니다.
test("Access 쿠키가 없으면 백엔드 요청 없이 비회원", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => { throw new Error("호출 금지"); });
  const session = await fetchRequestSession(undefined);
  assert.equal(session.status, "guest");
  assert.equal(fetchMock.mock.callCount(), 0);
});

test("Access만 Cookie 헤더로 전달하고 no-store로 사용자별 조회", async () => {
  mock.method(globalThis, "fetch", async (url: URL, options: RequestInit) => {
    assert.equal(url.pathname, "/auth/me");
    assert.equal(new Headers(options.headers).get("cookie"), "accessToken=test.jwt.value");
    assert.equal(options.cache, "no-store");
    assert.equal(options.credentials, "include");
    return Response.json({ success: true, data: { user: customer } });
  });
  const session = await fetchRequestSession("test.jwt.value");
  assert.deepEqual(session.user, customer);
  assert.equal(session.isAuthenticated, true);
  assert.equal(getAuthAccess(session.user, session.status, "CUSTOMER"), "allowed");
  assert.equal(getAuthAccess(session.user, session.status, "MOVER"), "role-mismatch");
});

test("프로필 미등록은 등록 페이지에서만 허용", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({
    success: true, data: { user: { ...customer, role: "MOVER", profileCompleted: false } },
  }));
  const session = await fetchRequestSession("test.jwt.value");
  assert.equal(getAuthAccess(session.user, session.status, "MOVER"), "profile-required");
  assert.equal(getAuthAccess(session.user, session.status, "MOVER", true), "allowed");
});

test("서버의 만료·잘못된 인증 401은 Refresh 없이 인증 실패", async () => {
  for (const code of ["ACCESS_TOKEN_EXPIRED", "ACCESS_TOKEN_INVALID", "USER_NOT_FOUND"]) {
    const fetchMock = mock.method(globalThis, "fetch", async () => Response.json({
      success: false, error: { code, message: "인증 실패" },
    }, { status: 401 }));
    const session = await fetchRequestSession("test.jwt.value");
    assert.equal(session.status, "auth-error");
    assert.equal(session.user, null);
    assert.equal(fetchMock.mock.callCount(), 1);
    mock.restoreAll();
  }
});

test("네트워크 오류와 잘못된 DTO는 비회원과 구분", async () => {
  mock.method(globalThis, "fetch", async () => { throw new TypeError("fetch failed"); });
  assert.equal((await fetchRequestSession("test.jwt.value")).status, "network-error");
  mock.restoreAll();
  mock.method(globalThis, "fetch", async () => Response.json({ success: true, data: { user: { ...customer, profileCompleted: undefined } } }));
  assert.equal((await fetchRequestSession("test.jwt.value")).status, "error");
});

test("서버 복구는 캐시된 user가 있어도 재조회 오류를 성공으로 취급하지 않는다", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const observer = new QueryObserver<AuthSession, Error>(client, {
    queryKey: ["recovery"], initialData: { user: customer, failure: null },
    queryFn: async () => { throw new TypeError("offline"); },
  });
  try { await assert.rejects(recoverServerSession(observer.refetch), TypeError); }
  finally { client.clear(); }
});

test("서버 복구가 끝나기 전에 로그아웃/계정 변경되면 늦은 사용자 응답을 거절한다", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const response = Promise.withResolvers<AuthSession>();
  const observer = new QueryObserver<AuthSession, Error>(client, {
    queryKey: ["recovery"], queryFn: () => response.promise,
  });
  const pending = recoverServerSession(observer.refetch);
  await changeAuthSession(async () => undefined);
  response.resolve({ user: customer, failure: null });
  try { await assert.rejects(pending, { name: "AbortError" }); }
  finally { client.clear(); }
});

test("동시 서버 복구는 Provider Query의 진행 중인 사용자 조회를 공유한다", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const response = Promise.withResolvers<AuthSession>();
  let requests = 0;
  const observer = new QueryObserver<AuthSession, Error>(client, {
    queryKey: ["recovery"], initialData: { user: customer, failure: null },
    queryFn: () => { requests += 1; return response.promise; },
  });
  const first = recoverServerSession(observer.refetch);
  const second = recoverServerSession(observer.refetch);
  response.resolve({ user: customer, failure: null });
  try {
    assert.deepEqual(await Promise.all([first, second]), [customer, customer]);
    assert.equal(requests, 1);
  } finally { client.clear(); }
});
