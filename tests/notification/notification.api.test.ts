import assert from "node:assert/strict";
import { afterEach, before, mock, test } from "node:test";

let fetchNotifications: typeof import("../../src/features/notification/notification.api").fetchNotifications;
let markNotificationRead: typeof import("../../src/features/notification/notification.api").markNotificationRead;

const success = (data: unknown) => Response.json({ success: true, data });
const failure = (status: number, code: string, message: string) =>
  new Response(JSON.stringify({ success: false, error: { code, message } }), { status });

function requestUrl(input: RequestInfo | URL): URL {
  return new URL(input instanceof Request ? input.url : String(input));
}

before(async () => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
  ({ fetchNotifications, markNotificationRead } = await import(
    "../../src/features/notification/notification.api"
  ));
});

afterEach(() => mock.restoreAll());

test("fetchNotifications는 파라미터가 없으면 limit/unreadOnly/cursor를 붙이지 않는다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    assert.equal(url.pathname, "/notifications");
    assert.equal(url.searchParams.has("limit"), false);
    assert.equal(url.searchParams.has("unreadOnly"), false);
    assert.equal(url.searchParams.has("cursor"), false);
    return success({ items: [], pagination: { nextCursor: null, hasNext: false } });
  });

  await fetchNotifications();
});

test("fetchNotifications는 cursor로 다음 페이지를 요청한다(무한 스크롤 계약)", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL, options: RequestInit) => {
    const url = requestUrl(input);
    assert.equal(url.pathname, "/notifications");
    assert.equal(url.searchParams.get("limit"), "10");
    assert.equal(url.searchParams.get("cursor"), "cursor-abc");
    assert.equal(options.credentials, "include");
    return success({ items: [], pagination: { nextCursor: null, hasNext: false } });
  });

  await fetchNotifications({ limit: 10, cursor: "cursor-abc" });
});

test("fetchNotifications는 unreadOnly=true&limit=1로 배지용 존재 여부만 가볍게 조회할 수 있다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
    const url = requestUrl(input);
    assert.equal(url.searchParams.get("unreadOnly"), "true");
    assert.equal(url.searchParams.get("limit"), "1");
    return success({
      items: [
        {
          id: "n-1",
          type: "NEW_QUOTE",
          title: "새로운 견적이 도착했습니다.",
          content: "김코드 기사님의 소형이사 견적이 도착했어요",
          moveRequestId: null,
          quoteId: "quote-1",
          readAt: null,
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: { nextCursor: "next", hasNext: true },
    });
  });

  const result = await fetchNotifications({ unreadOnly: true, limit: 1 });
  assert.equal(result.items.length, 1);
  assert.equal(result.pagination.hasNext, true);
});

test("markNotificationRead는 PATCH /notifications/:id/read로 호출한다", async () => {
  mock.method(globalThis, "fetch", async (input: RequestInfo | URL, options: RequestInit) => {
    const url = requestUrl(input);
    assert.equal(url.pathname, "/notifications/notification-1/read");
    assert.equal(options.method, "PATCH");
    assert.equal(options.credentials, "include");
    return success({
      notification: {
        id: "notification-1",
        type: "NEW_QUOTE",
        title: "새로운 견적이 도착했습니다.",
        content: "김코드 기사님의 소형이사 견적이 도착했어요",
        moveRequestId: null,
        quoteId: "quote-1",
        readAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    });
  });

  const result = await markNotificationRead("notification-1");
  assert.ok(result.notification.readAt);
});

test("markNotificationRead 실패 시 ApiError로 거절한다", async () => {
  mock.method(globalThis, "fetch", async () => failure(404, "NOTIFICATION_NOT_FOUND", "알림을 찾을 수 없습니다."));

  await assert.rejects(
    () => markNotificationRead("missing-id"),
    (error: unknown) => error instanceof Error && error.message === "알림을 찾을 수 없습니다.",
  );
});
