import {
  formatJustNow,
  formatTimeAgo,
  SERVICE_TIME_ZONE,
} from "@/common/utils/date-format";

/**
 * 받은 요청 카드의 요청 시각을 상대 시간으로 표시합니다.
 * 1분 미만·미래 시각은 "방금 전", 7일 이상은 서비스 기준 시간대(Asia/Seoul)의 짧은 날짜로 표시합니다.
 * 화면 표시 전용이며 정렬·필터에는 ISO 원문(requestedAt)을 사용합니다.
 */
export function formatRequestedAt(
  dateString: string,
  locale: string,
  now: number = Date.now(),
): string {
  const requestedAt = new Date(dateString);
  const difference = now - requestedAt.getTime();

  if (Number.isNaN(difference)) {
    return dateString;
  }

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) {
    return formatJustNow(locale);
  }

  if (minutes < 60) {
    return formatTimeAgo(minutes, "minute", locale);
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return formatTimeAgo(hours, "hour", locale);
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return formatTimeAgo(days, "day", locale);
  }

  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : locale, {
    timeZone: SERVICE_TIME_ZONE,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(requestedAt);
}
