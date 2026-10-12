import assert from "node:assert/strict";
import { test } from "node:test";

import { toGnbNotificationItem } from "../../src/features/notification/notification.mapper";
import type { NotificationApiItem } from "../../src/features/notification/notification.types";

function buildItem(overrides: Partial<NotificationApiItem>): NotificationApiItem {
  return {
    id: "notification-1",
    type: "NEW_QUOTE",
    title: "제목",
    content: "내용",
    moveRequestId: null,
    quoteId: null,
    readAt: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

test("NEW_QUOTE는 '{서비스}견적' 구간만 강조하고 고객의 견적 상세로 이동한다", () => {
  const item = buildItem({
    type: "NEW_QUOTE",
    content: "김코드 기사님의 소형이사 견적이 도착했어요",
    quoteId: "quote-1",
  });

  const result = toGnbNotificationItem(item, "CUSTOMER");

  assert.deepEqual(result.segments, [
    { text: "김코드 기사님의 " },
    { text: "소형이사 견적", emphasis: true },
    { text: "이 도착했어요" },
  ]);
  assert.equal(result.href, "/customer-quote/quote-1");
});

test("NEW_QUOTE는 quoteId가 없으면 href를 생략한다(클릭 불가 정적 행)", () => {
  const item = buildItem({ type: "NEW_QUOTE", content: "김코드 기사님의 소형이사 견적이 도착했어요", quoteId: null });

  const result = toGnbNotificationItem(item, "CUSTOMER");

  assert.equal(result.href, undefined);
});

test("QUOTE_CONFIRMED는 role에 따라 고객/기사 견적 상세로 각각 이동한다", () => {
  const item = buildItem({ type: "QUOTE_CONFIRMED", content: "김코드 기사님의 견적이 확정되었습니다.", quoteId: "quote-2" });

  const forCustomer = toGnbNotificationItem(item, "CUSTOMER");
  const forMover = toGnbNotificationItem(item, "MOVER");

  assert.equal(forCustomer.href, "/customer-quote/quote-2");
  assert.equal(forMover.href, "/mover-quote/quote-2");
  assert.deepEqual(forCustomer.segments, [
    { text: "김코드 기사님의 견적이 " },
    { text: "확정", emphasis: true },
    { text: "되었습니다." },
  ]);
});

test("NEW_MOVE_REQUEST는 고정 문구를 강조하고 기사님 요청 목록으로 이동한다", () => {
  const item = buildItem({ type: "NEW_MOVE_REQUEST", content: "고객님이 새로운 이사 견적을 요청했습니다." });

  const result = toGnbNotificationItem(item, "MOVER");

  assert.deepEqual(result.segments, [
    { text: "고객님이 " },
    { text: "새로운 이사 견적을 요청", emphasis: true },
    { text: "했습니다." },
  ]);
  assert.equal(result.href, "/requests");
});

test("MOVE_DAY는 quoteId가 있어도 이동 대상이 애매해 href를 생략한다", () => {
  const item = buildItem({
    type: "MOVE_DAY",
    content: "내일은 경기(일산) → 서울(영등포) 이사 예정일이에요.",
    quoteId: "quote-3",
  });

  const result = toGnbNotificationItem(item, "CUSTOMER");

  assert.equal(result.href, undefined);
  assert.deepEqual(result.segments, [
    { text: "내일은 " },
    { text: "경기(일산) → 서울(영등포) 이사 예정일", emphasis: true },
    { text: "이에요." },
  ]);
});

test("MOVE_REQUEST_CANCELED는 기사님의 보낸 견적 상세로 이동한다", () => {
  const item = buildItem({
    type: "MOVE_REQUEST_CANCELED",
    content: "홍길동 고객님이 보내주신 견적 요청을 취소했습니다.",
    quoteId: "quote-4",
  });

  const result = toGnbNotificationItem(item, "MOVER");

  assert.equal(result.href, "/mover-quote/quote-4");
  assert.deepEqual(result.segments, [
    { text: "홍길동 고객님이 보내주신 " },
    { text: "견적 요청을 취소", emphasis: true },
    { text: "했습니다." },
  ]);
});

test("QUOTE_CANCELED_BY_MOVER_WITHDRAWAL는 삭제된 견적 대신 고객의 받은 견적 목록으로 이동한다", () => {
  const item = buildItem({
    type: "QUOTE_CANCELED_BY_MOVER_WITHDRAWAL",
    content: "김코드 기사님이 계정을 탈퇴하여 보내드린 견적이 취소되었습니다.",
    // 기사님 탈퇴로 견적이 삭제되면 BE가 quoteId를 null로 비웁니다.
    quoteId: null,
  });

  const result = toGnbNotificationItem(item, "CUSTOMER");

  assert.equal(result.href, "/customer-quote");
  assert.deepEqual(result.segments, [
    { text: "김코드 기사님이 계정을 탈퇴하여 보내드린 " },
    { text: "견적이 취소", emphasis: true },
    { text: "되었습니다." },
  ]);
});

test("CONFIRMED_MOVE_CANCELED는 기사님의 보낸 견적 상세로 이동한다", () => {
  const item = buildItem({
    type: "CONFIRMED_MOVE_CANCELED",
    content: "홍길동 고객님이 계정을 탈퇴하여 확정된 이사 일정이 취소되었습니다.",
    quoteId: "quote-5",
  });

  const result = toGnbNotificationItem(item, "MOVER");

  assert.equal(result.href, "/mover-quote/quote-5");
  assert.deepEqual(result.segments, [
    { text: "홍길동 고객님이 계정을 탈퇴하여 " },
    { text: "확정된 이사 일정이 취소", emphasis: true },
    { text: "되었습니다." },
  ]);
});

test("CANCELED 계열도 quoteId가 없으면 href를 생략한다", () => {
  const item = buildItem({
    type: "MOVE_REQUEST_CANCELED",
    content: "홍길동 고객님이 보내주신 견적 요청을 취소했습니다.",
    quoteId: null,
  });

  const result = toGnbNotificationItem(item, "MOVER");

  assert.equal(result.href, undefined);
});

test("강조 패턴이 매치하지 않으면 강조 없이 문장 전체를 그대로 보여준다", () => {
  const item = buildItem({ type: "NEW_QUOTE", content: "예상하지 못한 새 문구 형식입니다" });

  const result = toGnbNotificationItem(item, "CUSTOMER");

  assert.deepEqual(result.segments, [{ text: "예상하지 못한 새 문구 형식입니다" }]);
});

test("readAt 유무로 isRead를 정확히 구분한다", () => {
  const unread = toGnbNotificationItem(buildItem({ readAt: null }), "CUSTOMER");
  const read = toGnbNotificationItem(buildItem({ readAt: "2026-09-30T00:00:00.000Z" }), "CUSTOMER");

  assert.equal(unread.isRead, false);
  assert.equal(read.isRead, true);
});

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

test("상대 시간은 경계값에서 분/시간/일/주/오래전 단위로 정확히 바뀐다", () => {
  assert.equal(toGnbNotificationItem(buildItem({ createdAt: minutesAgo(0.5) }), "CUSTOMER").timeAgo, "방금 전");
  assert.equal(toGnbNotificationItem(buildItem({ createdAt: minutesAgo(5) }), "CUSTOMER").timeAgo, "5분 전");
  assert.equal(toGnbNotificationItem(buildItem({ createdAt: minutesAgo(60 * 3) }), "CUSTOMER").timeAgo, "3시간 전");
  assert.equal(toGnbNotificationItem(buildItem({ createdAt: minutesAgo(60 * 24 * 2) }), "CUSTOMER").timeAgo, "2일 전");
  assert.equal(toGnbNotificationItem(buildItem({ createdAt: minutesAgo(60 * 24 * 10) }), "CUSTOMER").timeAgo, "1주 전");
  assert.equal(toGnbNotificationItem(buildItem({ createdAt: minutesAgo(60 * 24 * 40) }), "CUSTOMER").timeAgo, "오래전");
});
