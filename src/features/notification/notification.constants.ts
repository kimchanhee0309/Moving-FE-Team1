/** GNB 알림 목록 Query의 query key factory입니다. 다른 feature와 동일하게 배열 계층으로 관리합니다. */
export interface NotificationListParams {
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: NotificationListParams) =>
    [...notificationKeys.lists(), params] as const,
};

/**
 * GNB 알림 드롭다운은 페이지네이션 UI 없이 최근 알림만 보여주므로, 무한 스크롤 대신
 * 첫 페이지 하나만 이 개수로 조회합니다.
 */
export const NOTIFICATION_BELL_LIST_LIMIT = 10;
