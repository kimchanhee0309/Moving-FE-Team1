import type {
  GnbNotificationItem,
  GnbNotificationSegment,
} from "@/common/components/gnb/gnb.types";
import type { UserRole } from "@/common/constants/domain";
import { ROUTES } from "@/common/constants/routes";

import type { NotificationApiItem, NotificationType } from "./notification.types";

/**
 * `content` 문장 안에서 이 알림 종류를 대표하는 구간만 강조색으로 표시하기 위한 키워드입니다.
 * BE 문구가 이 키워드를 포함하지 않으면(문구가 바뀌었거나 예상 밖 값이면) 강조 없이 문장 전체를
 * 그대로 보여주므로, 문구가 달라져도 알림 자체가 깨지지는 않습니다.
 */
const EMPHASIS_KEYWORD_BY_TYPE: Record<NotificationType, string> = {
  NEW_QUOTE: "새로운 이사 견적",
  QUOTE_CONFIRMED: "확정",
  NEW_MOVE_REQUEST: "새로운 이사 견적 요청",
  MOVE_DAY: "이사",
};

function buildSegments(content: string, type: NotificationType): GnbNotificationSegment[] {
  const keyword = EMPHASIS_KEYWORD_BY_TYPE[type];
  const index = content.indexOf(keyword);

  if (index === -1) {
    return [{ text: content }];
  }

  const before = content.slice(0, index);
  const after = content.slice(index + keyword.length);

  return [
    ...(before ? [{ text: before }] : []),
    { text: keyword, emphasis: true },
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

/** "방금 전"/"N분 전"/"N시간 전"/"N일 전"/그 이후는 날짜로 표시합니다. */
function formatNotificationTimeAgo(dateString: string): string {
  const createdAt = new Date(dateString);
  const difference = Date.now() - createdAt.getTime();

  if (difference < 60_000) {
    return "방금 전";
  }

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}일 전`;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(createdAt);
}
