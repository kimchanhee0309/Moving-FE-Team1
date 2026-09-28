"use client";

import { useMemo, type PropsWithChildren } from "react";

import { NotificationBellContext } from "@/common/notification/NotificationBellContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useMarkNotificationRead,
  useNotificationBellList,
} from "@/features/notification/hooks/useNotifications";
import { useNotificationStream } from "@/features/notification/hooks/useNotificationStream";
import { toGnbNotificationItem } from "@/features/notification/notification.mapper";

/**
 * SSE 구독과 알림 목록·읽음 처리를 앱 전체에서 연결 하나로 관리합니다.
 * 이전에는 `GnbContainer`가 각 라우트 그룹 layout((public)/(customer)/(mover))마다 따로
 * 마운트되면서 SSE 연결도 그때마다 새로 열고 닫았는데, 이 Provider를 `AuthProvider` 아래
 * 루트에 두면 로그인 세션이 유지되는 동안 연결이 하나만 유지됩니다.
 * `AuthProvider`와 `QueryProvider` 안쪽에서만 렌더되어야 합니다(useAuth·useQuery 의존).
 */
export function NotificationProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  // BE 알림 endpoint 가드가 requireProfiledUser라 프로필 미등록 사용자는 403(PROFILE_REQUIRED)을
  // 받으므로, 로그인만으로는 부족하고 profileCompleted까지 확인해야 조회/구독을 시작할 수 있다.
  const canUseNotifications = !!user && user.profileCompleted;

  useNotificationStream(canUseNotifications);
  const notifications = useNotificationBellList(canUseNotifications);
  const markRead = useMarkNotificationRead();

  const role = user?.role;

  // pathname 변화나 다른 Provider 리렌더만으로 Context identity가 바뀌어 GNB가 매번 다시
  // 렌더되지 않도록 AuthProvider와 같은 방식으로 값을 메모이즈합니다. items는 useMemo 밖에서
  // 만들면 data가 undefined일 때마다 `?? []`가 새 배열을 만들어 매 렌더 dep이 바뀌므로 안에 둡니다.
  const value = useMemo(() => {
    const items = notifications.data?.items ?? [];
    const hasUnreadNotification = items.some((item) => item.readAt === null);
    const notificationItems = role
      ? items.map((item) => toGnbNotificationItem(item, role))
      : [];

    return {
      hasUnreadNotification,
      notificationItems,
      onNotificationClick: () => {
        if (canUseNotifications) {
          void notifications.refetch();
        }
      },
      onNotificationsRead: () => {
        // BE에 전체 읽음(bulk) API가 없어, 방금 보여준 항목 중 안 읽은 것만 각각 읽음 처리한다.
        items
          .filter((item) => item.readAt === null)
          .forEach((item) => markRead.mutate(item.id));
      },
    };
  }, [notifications, role, canUseNotifications, markRead]);

  return (
    <NotificationBellContext.Provider value={value}>
      {children}
    </NotificationBellContext.Provider>
  );
}
