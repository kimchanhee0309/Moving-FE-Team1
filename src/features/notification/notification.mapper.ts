import type {
  GnbNotificationItem,
  GnbNotificationSegment,
} from "@/common/components/gnb/gnb.types";
import type { UserRole } from "@/common/constants/domain";
import { ROUTES } from "@/common/constants/routes";

import type { NotificationApiItem, NotificationType } from "./notification.types";

/**
 * `content` 문장 안에서 이 알림 종류를 대표하는 구간만 강조색으로 표시하기 위한 resolver입니다.
 * Figma(스프린터 공유용 무빙_V2, node 510-45388)의 알림 드롭다운 디자인을 기준으로 강조 구간을
 * 맞췄다 — 예: "김코드 기사님의 [소형이사 견적]이 도착했어요", "김코드 기사님의 견적이 [확정]되었어요",
 * "내일은 [경기(일산) → 서울(영등포) 이사 예정일]이에요."
 *
 * NEW_QUOTE/MOVE_DAY/취소 계열은 서비스 유형·기사 닉네임·주소·고객 이름이 문구에 그대로 꽂혀 들어가
 * 매번 달라지므로 고정 키워드로는 못 맞춘다(실제로 예전엔 "새로운 이사 견적"이라는 키워드를 썼는데
 * 실제 BE 문구엔 "새로운"이 아예 없어 강조가 한 번도 안 뜨는 버그였다 — Figma와 직접 대조해서 발견함).
 * 대신 문구에서 절대 안 바뀌는 앞뒤 고정 부분을 정규식 앵커로 잡고 그 사이의 가변 구간을 통째로
 * 캡처한다. 정규식이 매치하지 않으면(문구가 바뀌었거나 예상 밖 값이면) 강조 없이 문장 전체를
 * 그대로 보여주므로, 문구가 달라져도 알림 자체가 깨지지는 않습니다.
 */
type EmphasisResolver = (content: string) => string | null;

function keyword(text: string): EmphasisResolver {
  return (content) => (content.includes(text) ? text : null);
}

function pattern(regex: RegExp): EmphasisResolver {
  return (content) => content.match(regex)?.[1] ?? null;
}

const EMPHASIS_RESOLVER_BY_TYPE: Record<NotificationType, EmphasisResolver> = {
  // "{모버닉네임} 기사님의 {서비스유형} 견적이 도착했어요" (mover-request.repository.ts createNewQuoteNotification)
  NEW_QUOTE: pattern(/기사님의\s(.+견적)이\s도착했어요/),
  // 고객/기사 양쪽 문구("...견적을 확정했습니다."/"...견적이 확정되었습니다.") 모두 "확정"만 공통.
  QUOTE_CONFIRMED: keyword("확정"),
  // "고객님이 새로운 이사 견적을 요청했습니다." (고정 문구, 가변 부분 없음)
  NEW_MOVE_REQUEST: keyword("새로운 이사 견적을 요청"),
  // "내일은 {fromAbbrev} → {toAbbrev} 이사 예정일이에요." (move-day.service.ts buildMoveDayContent)
  MOVE_DAY: pattern(/내일은\s(.+이사\s예정일)이에요\.$/),
  // "{고객명} 고객님이 (계정을 탈퇴하여 )?보내주신 견적 요청을/이 취소(했습니다|되었습니다)."
  // DIRECT_DELETE/WITHDRAWAL 두 문구 다 "보내주신"은 공통이라 이 앵커 하나로 둘 다 잡힌다.
  MOVE_REQUEST_CANCELED: pattern(/보내주신\s(.+?취소)/),
  // "{고객명} 고객님이 계정을 탈퇴하여 확정된 이사 일정이 취소되었습니다." (withdrawAccount 경로로만 도달)
  CONFIRMED_MOVE_CANCELED: pattern(/탈퇴하여\s(.+?취소)/),
};

function buildSegments(content: string, type: NotificationType): GnbNotificationSegment[] {
  const matchedKeyword = EMPHASIS_RESOLVER_BY_TYPE[type](content);

  if (matchedKeyword === null) {
    return [{ text: content }];
  }

  const index = content.indexOf(matchedKeyword);
  const before = content.slice(0, index);
  const after = content.slice(index + matchedKeyword.length);

  return [
    ...(before ? [{ text: before }] : []),
    { text: matchedKeyword, emphasis: true },
    ...(after ? [{ text: after }] : []),
  ];
}

/**
 * 알림을 클릭했을 때 이동할 경로입니다. role별로 같은 quoteId도 다른 화면(고객의 받은 견적
 * 상세 vs 기사님의 보낸 견적 상세)으로 가야 해서 role을 함께 받습니다.
 * 이동 대상이 애매한 경우(MOVE_DAY, moveRequestId/quoteId가 없는 경우)는 href를 생략합니다 —
 * `GnbNotificationItem.href`는 생략 시 클릭 불가능한 정적 텍스트 행으로 렌더링되도록 이미
 * 설계돼 있습니다.
 */
function resolveHref(item: NotificationApiItem, role: UserRole): string | undefined {
  if (item.type === "NEW_QUOTE" && item.quoteId) {
    // 고객만 받는 알림입니다(BE가 견적 요청 고객에게만 생성).
    return ROUTES.CUSTOMER.QUOTE.DETAIL(item.quoteId);
  }

  if (item.type === "QUOTE_CONFIRMED" && item.quoteId) {
    return role === "MOVER"
      ? ROUTES.MOVER.QUOTE.DETAIL(item.quoteId)
      : ROUTES.CUSTOMER.QUOTE.DETAIL(item.quoteId);
  }

  if (item.type === "NEW_MOVE_REQUEST") {
    // 기사님별 받은 요청 상세 URI가 없어 목록으로만 보냅니다(BE도 이 알림 생성을 아직 보류 중).
    return ROUTES.MOVER.REQUESTS;
  }

  if (
    (item.type === "MOVE_REQUEST_CANCELED" || item.type === "CONFIRMED_MOVE_CANCELED") &&
    item.quoteId
  ) {
    // 두 알림 모두 기사님만 받으며(BE가 견적을 보낸 기사님에게만 생성), quoteId가 항상 채워져 있다
    // (move-request.repository.ts의 recipients가 quote 단위로 구성됨). 자신이 보낸 견적
    // 상세로 보낸다.
    return ROUTES.MOVER.QUOTE.DETAIL(item.quoteId);
  }

  return undefined;
}

/**
 * BE 알림 응답을 `Gnb`가 그리는 순수 표시용 타입으로 변환합니다.
 * `Gnb`/`GnbNotificationMenu`는 API를 모르는 공통 컴포넌트이므로 변환은 항상 이 경계에서 합니다.
 */
export function toGnbNotificationItem(
  item: NotificationApiItem,
  role: UserRole,
): GnbNotificationItem {
  return {
    id: item.id,
    segments: buildSegments(item.content, item.type),
    timeAgo: formatNotificationTimeAgo(item.createdAt),
    href: resolveHref(item, role),
    isRead: item.readAt !== null,
  };
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

/**
 * "방금 전"(1분 미만) → "N분 전"(1~59분) → "N시간 전"(1~23시간) → "N일 전"(1~6일) →
 * "N주 전"(7~29일) → "오래전"(30일 이상, 사용자가 확정한 구간).
 *
 * `NotificationProvider`가 매 분(`useNotificationTimeTick`) 재계산을 트리거해줘야 실제로
 * 시간이 흘러도 값이 갱신된다 — 이 함수 자체는 순수 계산만 하고 언제 다시 호출할지는 모른다.
 */
function formatNotificationTimeAgo(dateString: string): string {
  const createdAt = new Date(dateString);
  const difference = Date.now() - createdAt.getTime();

  if (difference < MINUTE_MS) {
    return "방금 전";
  }

  if (difference < HOUR_MS) {
    return `${Math.floor(difference / MINUTE_MS)}분 전`;
  }

  if (difference < DAY_MS) {
    return `${Math.floor(difference / HOUR_MS)}시간 전`;
  }

  if (difference < WEEK_MS) {
    return `${Math.floor(difference / DAY_MS)}일 전`;
  }

  if (difference < MONTH_MS) {
    return `${Math.floor(difference / WEEK_MS)}주 전`;
  }

  return "오래전";
}
