/**
 * 화면 표시용 날짜 문자열을 locale에 맞게 만듭니다.
 * ko는 Figma에 고정된 기존 표기("2026년 10월 01일 (수)")를 그대로 유지하고, 그 외 locale은 Intl 표준 표기를 씁니다.
 * 서버로 보내는 값, 정렬, 비교에는 사용하지 않습니다. 잘못된 날짜는 원문을 그대로 반환합니다.
 */

/**
 * 서버가 준 ISO 날짜는 이 시간대로 고정해 표시합니다.
 * SSR 서버(UTC 등)와 브라우저의 시간대가 달라도 같은 날짜를 그려 hydration 불일치를 막습니다.
 */
export const SERVICE_TIME_ZONE = "Asia/Seoul";

const KOREAN_LOCALE = "ko";

interface DateParts {
  year: string;
  month: string;
  day: string;
  weekday: string;
  hour: string;
  minute: string;
}

function toValidDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getKoreanParts(date: Date, timeZone?: string): DateParts {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    weekday: read("weekday"),
    hour: read("hour"),
    minute: read("minute"),
  };
}

function fallback(value: string | Date): string {
  return value instanceof Date ? "" : value;
}

/** ko "2026년 10월 1일" · en "October 1, 2026" */
export function formatLongDate(value: string | Date, locale: string, timeZone?: string): string {
  const date = toValidDate(value);
  if (!date) return fallback(value);
  if (locale !== KOREAN_LOCALE) {
    return new Intl.DateTimeFormat(locale, { timeZone, year: "numeric", month: "long", day: "numeric" }).format(date);
  }
  const { year, month, day } = getKoreanParts(date, timeZone);
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

/** ko "2026년 10월 01일 (수)" · en "Wed, Oct 01, 2026" */
export function formatDateWithWeekday(value: string | Date, locale: string, timeZone?: string): string {
  const date = toValidDate(value);
  if (!date) return fallback(value);
  if (locale !== KOREAN_LOCALE) {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
  }
  const { year, month, day, weekday } = getKoreanParts(date, timeZone);
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

/** ko "2026. 10. 01(수) 오전 09:00" · en "Wed, Oct 01, 2026, 09:00 AM" */
export function formatDateTimeWithWeekday(value: string | Date, locale: string, timeZone?: string): string {
  const date = toValidDate(value);
  if (!date) return fallback(value);
  if (locale !== KOREAN_LOCALE) {
    return new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  const { year, month, day, weekday, hour, minute } = getKoreanParts(date, timeZone);
  const hours = Number(hour);
  const period = hours < 12 ? "오전" : "오후";
  const hour12 = String(hours % 12 === 0 ? 12 : hours % 12).padStart(2, "0");
  return `${year}. ${month}. ${day}(${weekday}) ${period} ${hour12}:${minute}`;
}

export type TimeAgoUnit = "minute" | "hour" | "day" | "week";

const KOREAN_TIME_AGO_SUFFIX: Record<TimeAgoUnit, string> = {
  minute: "분 전",
  hour: "시간 전",
  day: "일 전",
  week: "주 전",
};

/** ko "5분 전" · en "5 minutes ago" */
export function formatTimeAgo(count: number, unit: TimeAgoUnit, locale: string): string {
  if (locale === KOREAN_LOCALE) return `${count}${KOREAN_TIME_AGO_SUFFIX[unit]}`;
  return new Intl.RelativeTimeFormat(locale, { numeric: "always" }).format(-count, unit);
}

// Intl.RelativeTimeFormat에 "방금 전"/"오래전" 같은 표현이 없어 지원 locale별로 고정합니다.
const JUST_NOW: Record<string, string> = { ko: "방금 전", en: "just now", zh: "刚刚", ja: "たった今" };
const LONG_AGO: Record<string, string> = { ko: "오래전", en: "a while ago", zh: "很久以前", ja: "しばらく前" };

/** ko "방금 전" · en "just now" · zh "刚刚" · ja "たった今" */
export function formatJustNow(locale: string): string {
  return JUST_NOW[locale] ?? JUST_NOW.en;
}

/** ko "오래전" · en "a while ago" · zh "很久以前" · ja "しばらく前" */
export function formatLongAgo(locale: string): string {
  return LONG_AGO[locale] ?? LONG_AGO.en;
}
