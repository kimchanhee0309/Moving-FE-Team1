/**
 * 알림 목록·읽음 API의 원본 응답과 SSE push payload 타입입니다.
 * 화면(GNB 알림 드롭다운)이 쓰는 표시용 타입(`GnbNotificationItem`)으로의 변환은
 * `notification.mapper.ts`가 담당합니다.
 *
 * BE `feat/notification-sse` 브랜치의 `notification.dto.ts`를 그대로 따릅니다. cursor/limit
 * 기본값, unreadOnly 필요 여부, 읽음 처리 단건/전체 여부는 BE 문서에도 "팀이 승인한 Swagger에
 * 아직 확정되지 않은 잠정 구현"이라고 명시돼 있어 계약이 바뀌면 이 파일도 함께 갱신해야 합니다.
 */

/** 백엔드 `NotificationType` enum. 화면 문구 매핑은 mapper에 둡니다. */
export type NotificationType =
  | "NEW_QUOTE"
  | "QUOTE_CONFIRMED"
  | "NEW_MOVE_REQUEST"
  | "MOVE_DAY"
  | "MOVE_REQUEST_CANCELED"
  | "CONFIRMED_MOVE_CANCELED";

/** `GET /notifications`, `PATCH /notifications/:id/read` 응답의 알림 한 건입니다. */
export interface NotificationApiItem {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  moveRequestId: string | null;
  quoteId: string | null;
  /** 읽지 않았으면 null입니다. */
  readAt: string | null;
  createdAt: string;
}

export interface NotificationCursorPagination {
  nextCursor: string | null;
  hasNext: boolean;
}

/** `GET /notifications`의 `data` 원본입니다. */
export interface NotificationListApiResponse {
  items: NotificationApiItem[];
  pagination: NotificationCursorPagination;
}

/** `PATCH /notifications/:id/read`의 `data` 원본입니다. */
export interface NotificationReadApiResponse {
  notification: NotificationApiItem;
}

/**
 * `GET /notifications/stream`(SSE)의 `event: notification` data payload입니다.
 * BE가 명시한 대로 Notification row 전체(id, readAt 포함)가 아니라 캐시 무효화 트리거용
 * 최소 정보이므로, 이 값 자체를 화면 상태로 쌓지 않고 알림 목록을 다시 불러오는 신호로만 씁니다.
 */
export interface NotificationStreamEvent {
  type: NotificationType;
  title: string;
  content: string;
  moveRequestId: string | null;
  quoteId: string | null;
  createdAt: string;
}
