"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ENV } from "@/common/constants/env";

import { notificationKeys } from "../notification.constants";

/**
 * `GET /notifications/stream`을 EventSource로 구독해 새 알림이 오면 알림 목록 캐시를
 * 무효화합니다. SSE payload 자체는 캐시에 쓰지 않습니다 — BE 문서대로 이 payload는 Notification
 * row 전체(id, readAt 등)를 담지 않는 최소 트리거 정보라, 화면에 필요한 정확한 최신 상태는
 * 항상 `GET /notifications`를 다시 불러와야 얻을 수 있습니다.
 *
 * `enabled`가 false로 바뀌면(로그아웃, 프로필 미등록) 연결을 닫습니다. 네트워크가 끊기면
 * 브라우저의 EventSource가 자체적으로 재연결을 시도하므로 별도 재시도 로직을 두지 않습니다.
 */
export function useNotificationStream(enabled: boolean): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // EventSource는 커스텀 헤더를 보낼 수 없어 HttpOnly accessToken 쿠키만으로 인증합니다.
    // withCredentials 없이 열면 쿠키가 전송되지 않아 BE가 401을 반환합니다.
    const eventSource = new EventSource(`${ENV.API_URL}/notifications/stream`, {
      withCredentials: true,
    });

    function handleNotificationEvent() {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    }

    eventSource.addEventListener("notification", handleNotificationEvent);

    return () => {
      eventSource.removeEventListener("notification", handleNotificationEvent);
      eventSource.close();
    };
  }, [enabled, queryClient]);
}
