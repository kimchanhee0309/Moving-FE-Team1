"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchNotifications, markNotificationRead } from "../notification.api";
import {
  NOTIFICATION_BELL_LIST_LIMIT,
  notificationKeys,
} from "../notification.constants";

/**
 * GNB 알림 드롭다운에 보여줄 최근 알림 목록입니다.
 * `enabled`는 로그인 + 프로필 등록 여부를 호출부(`GnbContainer`)가 판단해 넘깁니다 — BE
 * 가드가 `requireProfiledUser`라 프로필 미등록 상태로 호출하면 403(PROFILE_REQUIRED)입니다.
 */
export function useNotificationBellList(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.list({ limit: NOTIFICATION_BELL_LIST_LIMIT }),
    queryFn: () => fetchNotifications({ limit: NOTIFICATION_BELL_LIST_LIMIT }),
    enabled,
    staleTime: 30_000,
  });
}

/**
 * 알림 1건을 읽음 처리하고 목록 캐시를 무효화합니다.
 * BE에 전체 읽음(bulk) API가 없어 "드롭다운을 닫으면 보인 알림을 전부 읽음 처리"하는 동작은
 * 호출부가 안 읽은 항목마다 이 mutation을 반복 호출하는 방식으로 구성합니다.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
  });
}
