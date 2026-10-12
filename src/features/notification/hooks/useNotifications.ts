"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchNotifications, markNotificationRead } from "../notification.api";
import {
  NOTIFICATION_BELL_LIST_LIMIT,
  notificationKeys,
} from "../notification.constants";

/**
 * GNB 알림 드롭다운에 보여줄 알림 목록입니다. 처음엔 최근 10건만 불러오고, 드롭다운 안에서
 * 스크롤을 끝까지 내리면(`fetchNextPage`) `pagination.nextCursor`로 다음 10건을 이어 불러옵니다
 * — 과거엔 최근 10건 밖의 알림을 드롭다운에서 아예 볼 수 없어 읽음 처리할 방법이 없었습니다.
 * `enabled`는 로그인 + 프로필 등록 여부를 호출부(`GnbContainer`)가 판단해 넘깁니다 — BE
 * 가드가 `requireProfiledUser`라 프로필 미등록 상태로 호출하면 403(PROFILE_REQUIRED)입니다.
 */
export function useNotificationBellList(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: notificationKeys.infiniteList(),
    queryFn: ({ pageParam }) =>
      fetchNotifications({ limit: NOTIFICATION_BELL_LIST_LIMIT, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.nextCursor ?? undefined : undefined,
    enabled,
    staleTime: 30_000,
  });
}

/**
 * 드롭다운이 보여주는 최근 10건과 별개로, 안 읽은 알림이 전체 범위에 하나라도 있는지
 * 확인합니다. 최근 10건이 모두 읽음 처리돼도 그보다 오래된 안 읽은 알림이 남아있을 수
 * 있어, 드롭다운 목록(`useNotificationBellList`)의 `items`만으로는 배지 노출 여부를
 * 정확히 판단할 수 없습니다. `unreadOnly=true&limit=1`로 존재 여부만 가볍게 조회합니다.
 */
export function useHasUnreadNotification(enabled: boolean) {
  return useQuery({
    queryKey: notificationKeys.list({ unreadOnly: true, limit: 1 }),
    queryFn: () => fetchNotifications({ unreadOnly: true, limit: 1 }),
    enabled,
    staleTime: 30_000,
    select: (data) => data.items.length > 0,
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
