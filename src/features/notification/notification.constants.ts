/** GNB 알림 목록 Query의 query key factory입니다. 다른 feature와 동일하게 배열 계층으로 관리합니다. */
export interface NotificationListParams {
  limit?: number;
  unreadOnly?: boolean;
  cursor?: string;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (params: NotificationListParams) =>
    [...notificationKeys.lists(), params] as const,
  /** GNB 알림 드롭다운의 무한 스크롤 목록입니다. cursor는 페이지마다 달라지는 pageParam이라
   * key에 포함하지 않습니다(포함하면 페이지마다 별도 캐시로 쪼개져 무한 스크롤이 동작하지 않습니다). */
  infiniteList: () => [...notificationKeys.lists(), "infinite"] as const,
};

/**
 * GNB 알림 드롭다운은 페이지네이션 UI 없이 최근 알림만 보여주므로, 무한 스크롤 대신
 * 첫 페이지 하나만 이 개수로 조회합니다.
 */
export const NOTIFICATION_BELL_LIST_LIMIT = 10;
