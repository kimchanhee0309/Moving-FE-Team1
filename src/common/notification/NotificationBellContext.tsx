"use client";

import { createContext, useContext } from "react";

import type { GnbNotificationItem } from "@/common/components/gnb/gnb.types";

/**
 * GNB 알림 벨(`Gnb`/`GnbNotificationMenu`)이 그대로 props로 넘길 수 있는 값입니다.
 * 실제 목록 조회·SSE 구독·읽음 처리는 `NotificationProvider`가 소유하고, 이 Context는
 * 그 결과만 앱 전체에 전달합니다.
 */
export interface NotificationBellContextValue {
  hasUnreadNotification: boolean;
  notificationItems: GnbNotificationItem[];
  onNotificationClick: () => void;
  onNotificationsRead: () => void;
}

export const NotificationBellContext =
  createContext<NotificationBellContextValue | null>(null);

/** Provider 밖에서 쓰면 값이 조용히 비어있는 대신 즉시 에러로 드러나도록 합니다. */
export function useNotificationBell(): NotificationBellContextValue {
  const context = useContext(NotificationBellContext);

  if (!context) {
    throw new Error("useNotificationBell은 루트 NotificationProvider 안에서 사용해야 합니다.");
  }

  return context;
}
