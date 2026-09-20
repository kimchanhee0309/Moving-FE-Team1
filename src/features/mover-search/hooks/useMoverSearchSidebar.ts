"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { ApiError } from "@/common/api/error";
import {
  addFavoriteMover,
  fetchFavoriteMovers,
  removeFavoriteMover,
} from "@/features/favorite/favorite.api";
import { FAVORITE_LIST_PAGE_SIZE } from "@/features/favorite/favorite.constants";
import { favoriteKeys } from "@/features/favorite/favorite.keys";

import { fetchRecommendedMovers } from "../mover-search.api";
import {
  moverSearchQueryKeys,
  SIDEBAR_MOVER_LIMIT,
} from "../mover-search.constants";
import { mapFavoriteMoverToSearchResult } from "../mover-search.mapper";

export function useMoverSearchRecommended(enabled: boolean) {
  return useQuery({
    queryKey: moverSearchQueryKeys.recommended(),
    queryFn: ({ signal }) => fetchRecommendedMovers(signal),
    enabled,
  });
}

/**
 * 로그인 일반 유저의 찜 id·사이드바 카드입니다. 목록 하트는 1페이지(최대 50명) 기준입니다.
 * 등록/해제는 favorite API를 쓰고 `/favorite` 목록 캐시도 함께 무효화합니다.
 */
export function useMoverSearchFavorites(
  userId: string | undefined,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const queryKey = moverSearchQueryKeys.favorites(userId ?? "anonymous");

  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      fetchFavoriteMovers(
        { page: 1, pageSize: FAVORITE_LIST_PAGE_SIZE },
        signal,
      ),
    enabled: Boolean(userId) && enabled,
  });

  const favoriteMovers = useMemo(
    () => query.data?.items ?? [],
    [query.data],
  );
  const favoriteIds = useMemo(
    () => favoriteMovers.map((mover) => mover.id),
    [favoriteMovers],
  );
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const movers = useMemo(
    () =>
      favoriteMovers
        .slice(0, SIDEBAR_MOVER_LIMIT)
        .map(mapFavoriteMoverToSearchResult),
    [favoriteMovers],
  );

  const invalidateFavorites = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() }),
      queryClient.invalidateQueries({
        queryKey: [...moverSearchQueryKeys.all, "list"],
      }),
      queryClient.invalidateQueries({
        queryKey: [...moverSearchQueryKeys.all, "detail"],
      }),
      queryClient.invalidateQueries({
        queryKey: moverSearchQueryKeys.recommended(),
      }),
    ]);
  }, [queryClient, queryKey]);

  const toggleMutation = useMutation({
    mutationFn: async (moverId: string) => {
      if (favoriteIdSet.has(moverId)) {
        try {
          await removeFavoriteMover(moverId);
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 404)) {
            throw error;
          }
        }
        return;
      }

      try {
        await addFavoriteMover(moverId);
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 409)) {
          throw error;
        }
      }
    },
    onSettled: async () => {
      await invalidateFavorites();
    },
  });

  const toggleFavorite = useCallback(
    (moverId: string) => {
      if (!userId || toggleMutation.isPending) {
        return;
      }

      toggleMutation.mutate(moverId);
    },
    [toggleMutation, userId],
  );

  return {
    isPending: query.isPending,
    isError: query.isError,
    favoriteIds,
    favoriteIdSet,
    movers,
    toggleFavorite,
  };
}
