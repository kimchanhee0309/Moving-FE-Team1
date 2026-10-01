"use client";

import { useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { NotificationBellContext } from "@/common/notification/NotificationBellContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  useHasUnreadNotification,
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
  const hasUnread = useHasUnreadNotification(canUseNotifications);
  const markRead = useMarkNotificationRead();

  const role = user?.role;

  // `toGnbNotificationItem`이 만드는 timeAgo("N분 전" 등)는 Date.now() 기준 계산이라, 알림
  // 목록 데이터(notifications)가 안 바뀌어도 시간은 계속 흐른다. 이 tick이 없으면 마지막으로
  // data가 바뀐 시점에 계산된 timeAgo 문자열이 그대로 굳어버려서(예: 실제로는 8분 지났는데
  // 계속 "3시간 전"으로 표시) 드롭다운을 오래 열어두거나 새 알림이 한동안 안 와도 시간 표시가
  // 실제 경과 시간을 따라가지 못한다. 1분마다 강제로 리렌더시켜 재계산되게 한다.
  const [timeTick, setTimeTick] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeTick((tick) => tick + 1);
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  // pathname 변화나 다른 Provider 리렌더만으로 Context identity가 바뀌어 GNB가 매번 다시
  // 렌더되지 않도록 AuthProvider와 같은 방식으로 값을 메모이즈합니다. items는 useMemo 밖에서
  // 만들면 data가 undefined일 때마다 `?? []`가 새 배열을 만들어 매 렌더 dep이 바뀌므로 안에 둡니다.
  const value = useMemo(() => {
    const items = notifications.data?.pages.flatMap((page) => page.items) ?? [];
    const hasUnreadNotification = hasUnread.data ?? false;
    const notificationItems = role
      ? items.map((item) => toGnbNotificationItem(item, role))
      : [];

    return {
      hasUnreadNotification,
      notificationItems,
      hasMoreNotifications: notifications.hasNextPage ?? false,
      isLoadingMoreNotifications: notifications.isFetchingNextPage,
      onLoadMoreNotifications: () => {
        if (notifications.hasNextPage && !notifications.isFetchingNextPage) {
          void notifications.fetchNextPage();
        }
      },
      onNotificationClick: () => {
        if (canUseNotifications) {
          void notifications.refetch();
          void hasUnread.refetch();
        }
      },
      onNotificationsRead: () => {
        // BE에 전체 읽음(bulk) API가 없어, 지금까지 불러온(스크롤로 더 불러온 페이지 포함) 항목 중
        // 안 읽은 것만 각각 읽음 처리한다.
        items
          .filter((item) => item.readAt === null)
          .forEach((item) => markRead.mutate(item.id));
      },
    };
    // timeTick은 값 자체를 쓰지 않고 1분마다 재계산(timeAgo 갱신)을 트리거하는 용도로만 넣는다 —
    // exhaustive-deps는 함수 본문에서 안 읽는 값이라 "불필요"하다고 오탐한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications, hasUnread, role, canUseNotifications, markRead, timeTick]);

  return (
    <NotificationBellContext.Provider value={value}>
      {children}
    </NotificationBellContext.Provider>
  );
}
