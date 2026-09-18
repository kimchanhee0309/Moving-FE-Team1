"use client";

import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/common/api/error";

import { fetchFavoriteMovers, removeFavoriteMover } from "../favorite.api";
import { FAVORITE_LIST_PAGE_SIZE } from "../favorite.constants";
import { favoriteKeys } from "../favorite.keys";

/** 무한 스크롤 query key에는 page를 넣지 않습니다. */
const LIST_PARAMS = { pageSize: FAVORITE_LIST_PAGE_SIZE } as const;

/**
 * 찜한 기사님 목록 Infinite Query입니다.
 * Favorite API는 page/pageSize 기반이라 커서 대신 page를 pageParam으로 사용합니다.
 * FavoritePage 전용이며 기사님 찾기 사이드바 찜과는 캐시를 공유하지 않습니다.
 */
export function useFavoriteMovers() {
  return useInfiniteQuery({
    queryKey: favoriteKeys.list(LIST_PARAMS),
    queryFn: ({ pageParam, signal }) =>
      fetchFavoriteMovers(
        { page: pageParam, pageSize: LIST_PARAMS.pageSize },
        signal,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

/**
 * 선택 항목 삭제 Mutation입니다.
 * 일괄 DELETE API가 없어 moverId마다 DELETE를 호출한 뒤 목록을 무효화합니다.
 */
export function useRemoveFavoriteMovers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (moverIds: string[]) => {
      const results = await Promise.allSettled(
        moverIds.map((moverId) => removeFavoriteMover(moverId)),
      );

      const failures = results.filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );

      if (failures.length === 0) return;

      const firstError = failures[0]?.reason;
      if (firstError instanceof ApiError) {
        throw firstError;
      }

      throw new ApiError(
        500,
        "FAVORITE_REMOVE_FAILED",
        "선택한 찜을 삭제하지 못했습니다. 다시 시도해 주세요.",
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
    onError: async () => {
      // 일부만 성공했을 수 있어 목록을 다시 맞춥니다.
      await queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
  });
}
