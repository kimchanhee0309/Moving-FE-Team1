import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, mock, test } from "node:test";
import { QueryClient } from "@tanstack/react-query";
import { changeAuthSession, subscribeAuthFailure } from "../../src/common/api/auth-session";
import { ApiError } from "../../src/common/api/error";
import { getAuthAccess } from "../../src/common/auth/access";
import { getAuthSessionState } from "../../src/common/auth/session";
import { authHref, resolveAuthenticatedPath, safeAuthRedirect, validateAuthForm } from "../../src/features/auth/auth.utils";
import type { AuthSession, AuthUser } from "../../src/common/auth/types";

const customer: AuthUser = { id: "customer-1", name: "테스트", email: "test@example.com", phone: null, role: "CUSTOMER", profileCompleted: true };
const values = { name: " 테스트 ", email: " TEST@example.com ", phone: "01012345678", password: "Pass123!", passwordConfirm: "Pass123!" };
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
let apiClient: typeof import("../../src/common/api/client").apiClient;
let beginSocialLogin: typeof import("../../src/features/auth/auth.api").beginSocialLogin;
let fetchSession: typeof import("../../src/features/auth/auth.api").fetchSession;
let logoutSession: typeof import("../../src/features/auth/auth.api").logoutSession;
let submitCredentials: typeof import("../../src/features/auth/auth.api").submitCredentials;
let authenticateCredentials: typeof import("../../src/features/auth/auth.api").authenticateCredentials;
const success = (data: unknown) => Response.json({ success: true, data });
const failure = (code: string, status = 401) => Response.json({ success: false, error: { code, message: code } }, { status });
const pathname = (input: RequestInfo | URL) => new URL(input instanceof Request ? input.url : String(input)).pathname;

before(async () => {
  // 이 테스트는 실제 서버/개인 환경설정을 사용하지 않고 모든 HTTP 경계를 모의합니다.
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
  ({ apiClient } = await import("../../src/common/api/client"));
  ({ beginSocialLogin, fetchSession, logoutSession, submitCredentials, authenticateCredentials } = await import("../../src/features/auth/auth.api"));
  Object.defineProperty(globalThis, "window", { value: {}, configurable: true });
});
beforeEach(async () => { await changeAuthSession(async () => undefined); });
afterEach(() => { mock.restoreAll(); });
after(() => { if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow); else Reflect.deleteProperty(globalThis, "window"); });

test("잘못된 자격 증명 및 Auth endpoint 401은 Refresh하지 않는다", async () => {
  const paths: string[] = [];
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => { paths.push(pathname(input)); return failure("INVALID_CREDENTIALS"); });
  for (const path of ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/oauth/google"]) {
    await assert.rejects(apiClient(path), (error: unknown) => error instanceof ApiError && error.code === "INVALID_CREDENTIALS");
  }
  assert.deepEqual(paths, ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/oauth/google"]);
});

for (const code of ["ACCESS_TOKEN_EXPIRED", "ACCESS_TOKEN_MISSING"]) {
  test(code + "일 때 갱신 후 원 요청을 한 번 재시도한다", async () => {
    let calls = 0;
    let refreshes = 0;
    mock.method(globalThis, "fetch", async (input: RequestInfo | URL, options: RequestInit) => {
      assert.equal(options.credentials, "include");
      if (pathname(input) === "/auth/refresh") { refreshes += 1; assert.equal(options.method, "POST"); return success({ user: customer }); }
      calls += 1;
      return calls === 1 ? failure(code) : success({ value: "ok" });
    });
    assert.deepEqual(await apiClient("/private"), { value: "ok" });
    assert.equal(calls, 2);
    assert.equal(refreshes, 1);
  });
}

test("동시 요청·갱신 중 시작한 요청·늦은 401이 Refresh 하나를 공유한다", async () => {
  const refreshGate = Promise.withResolvers<void>();
  const lateGate = Promise.withResolvers<void>();
  const refreshStarted = Promise.withResolvers<void>();
  const arrivedDuringRefresh = Promise.withResolvers<void>();
  let refreshes = 0;
  let refreshed = false;
  const calls = new Map<string, number>();
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const path = pathname(input);
    if (path === "/auth/refresh") {
      refreshes += 1; refreshStarted.resolve(); await refreshGate.promise; refreshed = true; return success({ user: customer });
    }
    const count = (calls.get(path) ?? 0) + 1; calls.set(path, count);
    if (path === "/late" && count === 1) { await lateGate.promise; return failure("ACCESS_TOKEN_EXPIRED"); }
    if (path === "/during" && count === 1) arrivedDuringRefresh.resolve();
    return refreshed ? success({ path }) : failure("ACCESS_TOKEN_EXPIRED");
  });
  const requests = [apiClient("/one"), apiClient("/two"), apiClient("/late")];
  await refreshStarted.promise;
  requests.push(apiClient("/during"));
  await arrivedDuringRefresh.promise;
  refreshGate.resolve();
  await requests[0];
  lateGate.resolve();
  await Promise.all(requests);
  assert.equal(refreshes, 1);
  for (const count of calls.values()) assert.equal(count, 2);
});

test("갱신 실패는 세션 정리를 한 번 알리고 재귀 갱신하지 않는다", async () => {
  let refreshes = 0;
  const failures: unknown[] = [];
  const unsubscribe = subscribeAuthFailure((error) => failures.push(error));
  try {
    mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
      if (pathname(input) === "/auth/refresh") { refreshes += 1; return failure("REFRESH_TOKEN_EXPIRED"); }
      return failure("ACCESS_TOKEN_EXPIRED");
    });
    const results = await Promise.allSettled([apiClient("/one"), apiClient("/two")]);
    assert.ok(results.every((result) => result.status === "rejected"));
    assert.equal(refreshes, 1);
    assert.equal(failures.length, 1);
    assert.ok(failures[0] instanceof ApiError && failures[0].code === "REFRESH_TOKEN_EXPIRED");
  } finally { unsubscribe(); }
});

test("갱신 후에도 401이면 재시도를 끝내고 사용자 상태를 정리한다", async () => {
  let refreshes = 0;
  let calls = 0;
  const failures: unknown[] = [];
  const unsubscribe = subscribeAuthFailure((error) => failures.push(error));
  try {
    mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
      if (pathname(input) === "/auth/refresh") { refreshes += 1; return success({ user: customer }); }
      calls += 1; return failure("ACCESS_TOKEN_EXPIRED");
    });
    await assert.rejects(apiClient("/private"), ApiError);
    assert.equal(refreshes, 1); assert.equal(calls, 2); assert.equal(failures.length, 1);
  } finally { unsubscribe(); }
});

test("Access 위변조와 삭제된 사용자 오류는 갱신 없이 정리한다", async () => {
  for (const code of ["ACCESS_TOKEN_INVALID", "USER_NOT_FOUND"]) {
    const paths: string[] = [];
    mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => { paths.push(pathname(input)); return failure(code); });
    await assert.rejects(apiClient("/private"), ApiError);
    assert.deepEqual(paths, ["/private"]);
    mock.restoreAll();
  }
});

test("공유 갱신에서 한 소비자가 취소되어도 다른 소비자는 완료된다", async () => {
  const gate = Promise.withResolvers<void>();
  const started = Promise.withResolvers<void>();
  let refreshed = false;
  let refreshes = 0;
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    if (pathname(input) === "/auth/refresh") { refreshes += 1; started.resolve(); await gate.promise; refreshed = true; return success({ user: customer }); }
    return refreshed ? success({ ok: true }) : failure("ACCESS_TOKEN_EXPIRED");
  });
  const controller = new AbortController();
  const cancelled = apiClient("/one", { signal: controller.signal });
  const completed = apiClient("/two");
  const cancelledAssertion = assert.rejects(cancelled, (error: unknown) => error instanceof DOMException && error.name === "AbortError");
  await started.promise;
  controller.abort(); gate.resolve();
  await cancelledAssertion;
  assert.deepEqual(await completed, { ok: true }); assert.equal(refreshes, 1);
});

test("로그아웃 시작 전 및 도중 시작한 늦은 /me가 인증을 복구하지 않는다", async () => {
  const gate = Promise.withResolvers<void>();
  const logoutGate = Promise.withResolvers<void>();
  const logoutStarted = Promise.withResolvers<void>();
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    if (pathname(input) === "/auth/logout") { logoutStarted.resolve(); await logoutGate.promise; return success(null); }
    await gate.promise; return success({ user: customer });
  });
  const beforeLogout = fetchSession();
  const beforeAssertion = assert.rejects(beforeLogout, (error: unknown) => error instanceof DOMException && error.name === "AbortError");
  const logout = logoutSession();
  await logoutStarted.promise;
  const duringLogout = fetchSession();
  const duringAssertion = assert.rejects(duringLogout, (error: unknown) => error instanceof DOMException && error.name === "AbortError");
  logoutGate.resolve(); await logout;
  gate.resolve(); await Promise.all([beforeAssertion, duringAssertion]);
});

test("진행 중 Refresh보다 로그아웃 쿠키 삭제가 마지막에 실행된다", async () => {
  const gate = Promise.withResolvers<void>();
  const started = Promise.withResolvers<void>();
  const order: string[] = [];
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const path = pathname(input);
    if (path === "/auth/refresh") { started.resolve(); await gate.promise; order.push("refresh"); return success({ user: customer }); }
    if (path === "/auth/logout") { order.push("logout"); return success(null); }
    return failure("ACCESS_TOKEN_EXPIRED");
  });
  const request = apiClient("/private");
  const rejected = assert.rejects(request, (error: unknown) => error instanceof DOMException && error.name === "AbortError");
  await started.promise;
  const logout = logoutSession(); gate.resolve();
  await Promise.all([logout, rejected]); assert.deepEqual(order, ["refresh", "logout"]);
});

test("필드 오류·Headers·쿼리·FormData 계약을 보존한다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL, options: RequestInit) => {
    assert.equal(new URL(String(input)).searchParams.get("page"), "2");
    assert.equal(new Headers(options.headers).get("X-Test"), "yes");
    assert.equal(new Headers(options.headers).has("Content-Type"), false);
    return Response.json({ success: false, error: { code: "VALIDATION_ERROR", message: "입력 오류", details: [{ field: "email", reason: "이메일 오류" }] } }, { status: 400 });
  });
  await assert.rejects(apiClient("/data", { query: { page: 2 }, headers: new Headers({ "X-Test": "yes" }), body: new FormData(), method: "POST" }),
    (error: unknown) => error instanceof ApiError && error.details[0]?.field === "email");
});

test("비회원·인증 실패·네트워크 오류를 구분하고 잘못된 DTO를 거절한다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => failure(pathname(input) === "/auth/refresh" ? "REFRESH_TOKEN_MISSING" : "ACCESS_TOKEN_MISSING"));
  assert.deepEqual(await fetchSession(), { user: null, failure: null });
  mock.restoreAll();
  mock.method(globalThis, "fetch", async () => failure("ACCESS_TOKEN_INVALID"));
  const invalid = await fetchSession(); assert.equal(invalid.user, null); assert.ok(invalid.failure instanceof ApiError);
  mock.restoreAll();
  mock.method(globalThis, "fetch", async () => { throw new TypeError("Network failure"); });
  await assert.rejects(fetchSession(), TypeError);
  mock.restoreAll();
  mock.method(globalThis, "fetch", async () => success({ user: { ...customer, email: null } }));
  await assert.rejects(fetchSession(), (error: unknown) => error instanceof ApiError && error.code === "INVALID_RESPONSE");
});

test("두 역할 이메일 가입/로그인의 DTO와 data.user를 사용한다", async () => {
  for (const role of ["CUSTOMER", "MOVER"] as const) {
    for (const mode of ["signup", "login"] as const) {
      mock.method(globalThis, "fetch", async (input: RequestInfo | URL, options: RequestInit) => {
        assert.equal(pathname(input), "/auth/" + mode);
        assert.equal(options.method, "POST");
        const payload: unknown = JSON.parse(String(options.body));
        assert.deepEqual(payload, { email: "test@example.com", password: values.password, role, ...(mode === "signup" ? { name: "테스트", phone: values.phone } : {}) });
        return success({ user: { ...customer, role } });
      });
      assert.equal((await submitCredentials(mode, role, values)).user.role, role); mock.restoreAll();
    }
  }
});

test("Google/Kakao/Naver 시작에 역할 및 안전한 redirect를 전송한다", async () => {
  for (const provider of ["google", "kakao", "naver"] as const) {
    const host = { google: "accounts.google.com", kakao: "kauth.kakao.com", naver: "nid.naver.com" }[provider];
    mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
      const url = new URL(String(input));
      assert.equal(url.pathname, "/auth/oauth/" + provider);
      assert.equal(url.searchParams.get("role"), "MOVER"); assert.equal(url.searchParams.get("format"), "json");
      assert.equal(url.searchParams.get("redirect"), "/requests");
      return success({ url: "https://" + host + "/authorize" });
    });
    assert.deepEqual(await beginSocialLogin(provider, "MOVER", "/requests"), { url: "https://" + host + "/authorize" });
    mock.restoreAll();
  }
});

test("프로필 등록·역할별 진입·안전하지 않은 목적지와 다른 역할 이동을 처리한다", () => {
  assert.equal(resolveAuthenticatedPath({ ...customer, profileCompleted: false }, "/favorite"), "/customer-profile/register");
  assert.equal(resolveAuthenticatedPath({ ...customer, role: "MOVER", profileCompleted: false }), "/mover-profile/register");
  assert.equal(resolveAuthenticatedPath({ ...customer, role: "MOVER" }), "/mover-mypage");
  assert.equal(resolveAuthenticatedPath(customer), "/mover-search");
  assert.equal(resolveAuthenticatedPath(customer, "/favorite?sort=recent"), "/favorite?sort=recent");
  assert.equal(resolveAuthenticatedPath(customer, "/requests"), "/mover-search");
  assert.equal(resolveAuthenticatedPath({ ...customer, role: "MOVER" }, "/customer-profile/edit"), "/mover-mypage");
  assert.equal(resolveAuthenticatedPath(customer, "/customer-profile/register"), "/mover-search");
  for (const path of ["https://evil.example", "//evil.example", "/\\evil.example", "/login/customer", "/auth/callback", "/signup/mover", "/a\n"]) assert.equal(safeAuthRedirect(path), undefined);
});

test("백엔드 휴대전화·이름·비밀번호 바이트 제한에 맞춰 검증한다", () => {
  assert.deepEqual(validateAuthForm(values, "signup"), {});
  assert.ok(validateAuthForm({ ...values, phone: "0212345678" }, "signup").phone);
  assert.ok(validateAuthForm({ ...values, name: "a".repeat(51) }, "signup").name);
  assert.ok(validateAuthForm({ ...values, password: "가".repeat(24) + "A1!" }, "signup").password);
  assert.deepEqual(validateAuthForm({ ...values, password: "old" }, "login"), {});
});

test("Provider 인증 명령은 쿠키로 최신 /me 사용자까지 확인한다", async () => {
  const paths: string[] = [];
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const path = pathname(input); paths.push(path);
    return success({ user: path === "/auth/login" ? { ...customer, name: "이전 응답" } : customer });
  });
  assert.deepEqual(await authenticateCredentials({ mode: "login", role: "CUSTOMER", email: values.email, password: values.password }), { user: customer });
  assert.deepEqual(paths, ["/auth/login", "/auth/me"]);
});

test("가입 응답이 성공해도 쿠키 세션이 없으면 로그인 완료로 처리하지 않는다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const path = pathname(input);
    if (path === "/auth/signup") return success({ user: customer });
    return failure(path === "/auth/refresh" ? "REFRESH_TOKEN_MISSING" : "ACCESS_TOKEN_MISSING");
  });
  await assert.rejects(authenticateCredentials({ mode: "signup", role: "CUSTOMER", email: values.email, password: values.password, name: values.name, phone: values.phone }),
    (error: unknown) => error instanceof ApiError && error.code === "AUTH_SESSION_UNAVAILABLE");
});

test("Provider의 화면 인가는 비회원·역할·프로필·오류 상태를 구분한다", () => {
  assert.equal(getAuthAccess(null, "loading", "CUSTOMER"), "loading");
  assert.equal(getAuthAccess(null, "guest", "CUSTOMER"), "guest");
  for (const status of ["auth-error", "network-error", "error"] as const) assert.equal(getAuthAccess(customer, status, "CUSTOMER"), "unavailable");
  for (const role of ["CUSTOMER", "MOVER"] as const) {
    const user = { ...customer, role, profileCompleted: false };
    assert.equal(getAuthAccess(user, "authenticated", role), "profile-required");
    assert.equal(getAuthAccess(user, "authenticated", role, true), "allowed");
    assert.equal(getAuthAccess(user, "authenticated", role === "CUSTOMER" ? "MOVER" : "CUSTOMER", true), "role-mismatch");
    assert.equal(getAuthAccess({ ...user, profileCompleted: true }, "authenticated", role), "allowed");
  }
});

test("Refresh 네트워크 오류를 사용자 상태 정리 알림으로 전달한다", async () => {
  const failures: unknown[] = [];
  const unsubscribe = subscribeAuthFailure((error) => failures.push(error));
  try {
    mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
      if (pathname(input) === "/auth/refresh") throw new TypeError("Network failure");
      return failure("ACCESS_TOKEN_EXPIRED");
    });
    await assert.rejects(apiClient("/private"), TypeError);
    assert.equal(failures.length, 1);
    assert.ok(failures[0] instanceof TypeError);
  } finally { unsubscribe(); }
});


test("OAuth 시작 응답의 잘못된 주소와 다른 공급자 주소를 거절한다", async () => {
  for (const data of [{ url: "https://evil.example/login" }, { url: "http://accounts.google.com/login" }, { url: "https://nid.naver.com/login" }, { url: "invalid-url" }, {}]) {
    mock.method(globalThis, "fetch", async () => success(data));
    await assert.rejects(beginSocialLogin("google", "CUSTOMER"), (error: unknown) => error instanceof ApiError && error.code === "INVALID_RESPONSE");
    mock.restoreAll();
  }
});

test("캐시된 세션의 /me 재조회가 네트워크 오류여도 로그인 표시를 유지하고 복구한다", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const queryKey = ["auth", "session"];
  const options = { queryKey, queryFn: () => fetchSession(), staleTime: 0 };
  try {
    mock.method(globalThis, "fetch", async () => success({ user: customer }));
    await client.fetchQuery(options);
    mock.restoreAll();
    const networkError = new TypeError("Network failure");
    mock.method(globalThis, "fetch", async () => { throw networkError; });
    await assert.rejects(client.fetchQuery(options), TypeError);
    const query = client.getQueryState<AuthSession>(queryKey);
    assert.ok(query);
    const state = getAuthSessionState(query.data, query.error, query.status === "pending");
    assert.deepEqual(state, { user: customer, status: "network-error", error: networkError, isAuthenticated: true });
    assert.equal(getAuthAccess(state.user, state.status, "CUSTOMER"), "unavailable");
    mock.restoreAll();
    mock.method(globalThis, "fetch", async () => success({ user: { ...customer, name: "복구된 사용자" } }));
    await client.fetchQuery(options);
    const recovered = client.getQueryState<AuthSession>(queryKey);
    assert.ok(recovered);
    const recoveredState = getAuthSessionState(recovered.data, recovered.error, recovered.status === "pending");
    assert.equal(recoveredState.status, "authenticated");
    assert.equal(recoveredState.user?.name, "복구된 사용자");
  } finally { client.clear(); }
});

test("캐시가 없는 네트워크 오류·401·세션 변경은 로그인 상태를 만들지 않는다", () => {
  const networkError = new TypeError("Network failure");
  assert.equal(getAuthSessionState(undefined, networkError, false).isAuthenticated, false);
  for (const error of [new ApiError(401, "ACCESS_TOKEN_INVALID", "인증 오류"), new Error("조회 오류")]) {
    const state = getAuthSessionState({ user: customer, failure: null }, error, false);
    assert.equal(state.user, null);
    assert.equal(state.isAuthenticated, false);
  }
  assert.equal(getAuthSessionState({ user: customer, failure: new ApiError(401, "REFRESH_TOKEN_INVALID", "인증 오류") }, null, false).status, "auth-error");
  assert.equal(getAuthSessionState({ user: customer, failure: networkError }, null, false).user, customer);
  assert.equal(getAuthSessionState({ user: customer, failure: null }, null, true).user, null);
  assert.equal(getAuthSessionState({ user: null, failure: null }, null, false).status, "guest");
});

test("010은 11자리만, 구형 휴대전화는 10·11자리만 허용한다", () => {
  for (const phone of ["01012345678", "010-1234-5678", "0111234567", "01612345678", "0171234567", "01812345678", "0191234567"]) {
    assert.equal(validateAuthForm({ ...values, phone }, "signup").phone, undefined);
  }
  for (const phone of ["0101234567", "010123456789", "011123456", "019123456789", "01512345678", "0212345678"]) {
    assert.ok(validateAuthForm({ ...values, phone }, "signup").phone);
  }
});

test("인증 오류 로그인 링크도 중복 키와 인코딩된 쿼리 목적지를 유지한다", () => {
  const destination = "/mover-mypage?view=error&filter=a&filter=b&name=%ED%95%9C%EA%B8%80";
  const login = new URL(authHref("/login/mover", destination), "https://moving.local");
  assert.equal(login.searchParams.get("redirect"), destination);
  assert.equal(resolveAuthenticatedPath({ ...customer, role: "MOVER" }, login.searchParams.get("redirect") ?? undefined), destination);
});

