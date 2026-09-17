"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/common/api/error";

import { fetchFavoriteMovers, removeFavoriteMover } from "../favorite.api";
import { FAVORITE_LIST_PAGE_SIZE } from "../favorite.constants";
import { favoriteKeys } from "../favorite.keys";

const LIST_PARAMS = { page: 1, pageSize: FAVORITE_LIST_PAGE_SIZE } as const;

/**
 * 찜한 기사님 목록 Query입니다.
 * FavoritePage 전용이며 기사님 찾기 사이드바 찜과는 캐시를 공유하지 않습니다.
 */
export function useFavoriteMovers() {
  return useQuery({
    queryKey: favoriteKeys.list(LIST_PARAMS),
    queryFn: ({ signal }) => fetchFavoriteMovers(LIST_PARAMS, signal),
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
