"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ENV } from "@/common/constants/env";

import { fetchNotifications } from "../notification.api";
import { notificationKeys } from "../notification.constants";

/** 복구 실패(네트워크 일시 장애 등) 시 다음 재시도까지 대기하는 시간입니다. */
const RECOVERY_RETRY_DELAY_MS = 5_000;

/**
 * `GET /notifications/stream`을 EventSource로 구독해 새 알림이 오면 알림 목록 캐시를
 * 무효화합니다. SSE payload 자체는 캐시에 쓰지 않습니다 — BE 문서대로 이 payload는 Notification
 * row 전체(id, readAt 등)를 담지 않는 최소 트리거 정보라, 화면에 필요한 정확한 최신 상태는
 * 항상 `GET /notifications`를 다시 불러와야 얻을 수 있습니다.
 *
 * `enabled`가 false로 바뀌면(로그아웃, 프로필 미등록) 연결을 닫습니다.
 *
 * EventSource는 커스텀 헤더를 보낼 수 없어 Access Token 쿠키 만료 시 `apiClient`의
 * 401→refresh 재시도 경로를 타지 못합니다. 그대로 두면 만료된 쿠키로 브라우저가 자체
 * 재연결을 무한 반복하며 계속 401만 받습니다. `error` 발생 시 직접 `close()`해 그 자동
 * 재연결을 끊고(single-flight), `fetchNotifications`(apiClient 경유)를 한 번 호출해 토큰
 * 갱신을 유도한 뒤 성공하면 재연결합니다. 진짜 로그아웃/세션 무효 상태라면 그 호출이
 * `invalidateAuthSession`을 거쳐 `AuthProvider`의 세션을 null로 만들고, 그 결과
 * `enabled`가 false로 바뀌면서 이 effect의 cleanup이 정리합니다 — 그 경우 여기서 직접
 * 재연결을 시도하지 않습니다. 그 외 실패(네트워크 일시 장애 등)만 지연 후 다시 시도합니다.
 */
export function useNotificationStream(enabled: boolean): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isCancelled = false;
    let isRecovering = false;
    let eventSource: EventSource | null = null;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

    function handleNotificationEvent() {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    }

    function handleOpen() {
      // 끊겨 있던 동안 놓쳤을 수 있는 알림을 재연결 시점에 보완한다.
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    }

    function closeSocket() {
      if (!eventSource) return;
      eventSource.removeEventListener("notification", handleNotificationEvent);
      eventSource.removeEventListener("open", handleOpen);
      eventSource.removeEventListener("error", handleError);
      eventSource.close();
      eventSource = null;
    }

    function handleError() {
      if (isCancelled || isRecovering) return;
      closeSocket();
      isRecovering = true;
      fetchNotifications({ limit: 1 })
        .then(() => {
          isRecovering = false;
          if (!isCancelled) connect();
        })
        .catch(() => {
          isRecovering = false;
          if (isCancelled) return;
          retryTimeoutId = setTimeout(() => {
            if (!isCancelled) connect();
          }, RECOVERY_RETRY_DELAY_MS);
        });
    }

    function connect() {
      // EventSource는 커스텀 헤더를 보낼 수 없어 HttpOnly accessToken 쿠키만으로 인증합니다.
      // withCredentials 없이 열면 쿠키가 전송되지 않아 BE가 401을 반환합니다.
      eventSource = new EventSource(`${ENV.API_URL}/notifications/stream`, {
        withCredentials: true,
      });
      eventSource.addEventListener("notification", handleNotificationEvent);
      eventSource.addEventListener("open", handleOpen);
      eventSource.addEventListener("error", handleError);
    }

    connect();

    return () => {
      isCancelled = true;
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      closeSocket();
    };
  }, [enabled, queryClient]);
}
