import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  formatDateTimeWithWeekday,
  formatDateWithWeekday,
  formatJustNow,
  formatLongAgo,
  formatLongDate,
  formatTimeAgo,
  SERVICE_TIME_ZONE,
} from "../../src/common/utils/date-format";
import { formatRequestedAt } from "../../src/features/mover-requests/mover-requests.utils";

type MessageTree = { [key: string]: string | MessageTree };

function collectKeys(tree: MessageTree, prefix = ""): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string" ? [`${prefix}${key}`] : collectKeys(value, `${prefix}${key}.`),
  );
}

async function readMessages(locale: string): Promise<MessageTree> {
  return JSON.parse(await readFile(`messages/${locale}.json`, "utf8")) as MessageTree;
}

const LOCALES = ["ko", "en", "zh"] as const;

test("모든 locale 메시지는 ko와 같은 키 구조를 가진다", async () => {
  const koKeys = collectKeys(await readMessages("ko")).sort();

  for (const locale of LOCALES) {
    assert.deepEqual(collectKeys(await readMessages(locale)).sort(), koKeys, locale);
  }
});

// 영어 존칭과 중국어 고객 존칭은 자연스러운 대응어가 없어 GNB 인사말 접미사를 의도적으로 비워 둡니다.
const INTENTIONALLY_EMPTY = new Set(["en:Common.customerHonorific", "en:Common.moverHonorific", "zh:Common.customerHonorific"]);

test("메시지 값은 비어 있지 않고 ICU 중괄호 짝이 맞는다", async () => {
  for (const locale of LOCALES) {
    const messages = await readMessages(locale);
    for (const key of collectKeys(messages)) {
      const value = key.split(".").reduce<string | MessageTree>((node, part) => (node as MessageTree)[part], messages);
      assert.equal(typeof value, "string", `${locale}:${key}`);
      if (!INTENTIONALLY_EMPTY.has(`${locale}:${key}`)) {
        assert.ok((value as string).trim().length > 0, `${locale}:${key} 값이 비어 있습니다.`);
      }
      const opens = (value as string).split("{").length;
      const closes = (value as string).split("}").length;
      assert.equal(opens, closes, `${locale}:${key} 중괄호 짝이 맞지 않습니다.`);
    }
  }
});

test("ko 날짜 표기는 기존 화면 문자열과 같다", () => {
  const iso = "2026-10-01T00:30:00.000Z";

  assert.equal(formatLongDate(iso, "ko", SERVICE_TIME_ZONE), "2026년 10월 1일");
  assert.equal(formatDateWithWeekday(iso, "ko", SERVICE_TIME_ZONE), "2026년 10월 01일 (목)");
  assert.equal(formatDateTimeWithWeekday(iso, "ko", SERVICE_TIME_ZONE), "2026. 10. 01(목) 오전 09:30");
  assert.equal(formatTimeAgo(3, "hour", "ko"), "3시간 전");
  assert.equal(formatJustNow("ko"), "방금 전");
  assert.equal(formatLongAgo("ko"), "오래전");
});

test("en 날짜 표기는 영어 Intl 표기를 사용한다", () => {
  const iso = "2026-10-01T00:30:00.000Z";

  assert.equal(formatLongDate(iso, "en", SERVICE_TIME_ZONE), "October 1, 2026");
  assert.equal(formatDateWithWeekday(iso, "en", SERVICE_TIME_ZONE), "Thu, Oct 01, 2026");
  assert.equal(formatTimeAgo(1, "minute", "en"), "1 minute ago");
  assert.equal(formatJustNow("en"), "just now");
});

test("zh 날짜·상대 시간은 중국어 표기를 사용한다", () => {
  const iso = "2026-10-01T00:30:00.000Z";

  assert.equal(formatLongDate(iso, "zh", SERVICE_TIME_ZONE), "2026年10月1日");
  assert.equal(formatTimeAgo(3, "hour", "zh"), "3小时前");
  assert.equal(formatJustNow("zh"), "刚刚");
  assert.equal(formatLongAgo("zh"), "很久以前");
});

test("잘못된 날짜는 예외 없이 원문을 반환한다", () => {
  assert.equal(formatLongDate("invalid", "en"), "invalid");
  assert.equal(formatDateWithWeekday("invalid", "ko"), "invalid");
});

test("받은 요청 시각은 locale별 상대 시간으로 표시한다", () => {
  const now = Date.parse("2026-10-01T12:00:00.000Z");

  assert.equal(formatRequestedAt("2026-10-01T11:59:40.000Z", "ko", now), "방금 전");
  assert.equal(formatRequestedAt("2026-10-01T11:30:00.000Z", "ko", now), "30분 전");
  assert.equal(formatRequestedAt("2026-10-01T09:00:00.000Z", "en", now), "3 hours ago");
  assert.equal(formatRequestedAt("2026-10-01T12:05:00.000Z", "en", now), "just now");
  assert.equal(formatRequestedAt("2026-09-01T12:00:00.000Z", "ko", now), "26. 09. 01.");
});
