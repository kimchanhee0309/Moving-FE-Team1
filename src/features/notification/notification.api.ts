import { apiClient } from "@/common/api/client";

import type { NotificationListParams } from "./notification.constants";
import type {
  NotificationListApiResponse,
  NotificationReadApiResponse,
} from "./notification.types";

/**
 * 로그인한 사용자(CUSTOMER/MOVER)의 알림을 생성 최신순으로 조회합니다.
 * BE 가드가 `requireProfiledUser`라 프로필 미등록 사용자는 403(PROFILE_REQUIRED)을 받습니다 —
 * 호출부(`hooks/useNotifications.ts`)가 `enabled`로 프로필 등록 여부를 먼저 확인해야 합니다.
 */
export function fetchNotifications(
  params: NotificationListParams = {},
): Promise<NotificationListApiResponse> {
  return apiClient<NotificationListApiResponse>("/notifications", {
    query: {
      limit: params.limit,
      unreadOnly: params.unreadOnly,
    },
  });
}

/**
 * 알림 1건을 읽음 처리합니다. BE는 이미 읽은 알림을 다시 호출해도 그대로 반환하는
 * idempotent 동작이라, 호출부가 이미 읽음 여부를 미리 걸러낼 필요는 없습니다.
 */
export function markNotificationRead(
  notificationId: string,
): Promise<NotificationReadApiResponse> {
  return apiClient<NotificationReadApiResponse>(
    `/notifications/${notificationId}/read`,
    { method: "PATCH" },
  );
}
