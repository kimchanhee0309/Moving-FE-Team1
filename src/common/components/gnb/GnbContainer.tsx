"use client";

import { useTranslations } from "next-intl";

import { useNotificationBell } from "@/common/notification/NotificationBellContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter } from "@/i18n/navigation";

import { Gnb } from "./Gnb";

/**
 * 서버 세션을 GNB에 연결합니다. 로그아웃 실패 시 세션을 임의로 지우지 않습니다.
 * 알림 목록·SSE 구독·읽음 처리는 루트 `NotificationProvider`가 소유하고, 이 컨테이너는
 * `useNotificationBell()`로 그 결과만 받아 `Gnb`에 전달합니다 — `Gnb`/`GnbNotificationMenu`는
 * API를 모르는 순수 표시 컴포넌트라는 공통 컴포넌트 원칙(AGENTS.md 6번)을 지키기 위함입니다.
 */
export function GnbContainer() {
  const t = useTranslations("Common");
  const router = useRouter();
  const { user, isPending, logout } = useAuth();
  const isInitialSessionLoading = isPending && !user;
  const {
    hasUnreadNotification,
    notificationItems,
    hasMoreNotifications,
    isLoadingMoreNotifications,
    onLoadMoreNotifications,
    onNotificationClick,
    onNotificationsRead,
  } = useNotificationBell();

  return <>
    <div aria-busy={isPending || logout.isPending}>
      {user ? (
        <Gnb
          isAuthenticated
          user={{ name: user.name, role: user.role }}
          onLogout={() => {
            if (!logout.isPending) logout.mutate(undefined, { onSuccess: () => router.replace("/") });
          }}
          hasUnreadNotification={hasUnreadNotification}
          notificationItems={notificationItems}
          hasMoreNotifications={hasMoreNotifications}
          isLoadingMoreNotifications={isLoadingMoreNotifications}
          onLoadMoreNotifications={onLoadMoreNotifications}
          onNotificationClick={onNotificationClick}
          onNotificationsRead={onNotificationsRead}
        />
      ) : (
        <Gnb isAuthenticated={false} isLoading={isInitialSessionLoading} />
      )}
    </div>
    {logout.isError && <p role="alert" className="p-4 text-center text-(--primary-400)">{t("logoutError")}</p>}
  </>;
}
