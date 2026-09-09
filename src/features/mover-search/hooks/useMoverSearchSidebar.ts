"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import {
  moverSearchQueryKeys,
  SIDEBAR_MOVER_LIMIT,
} from "../mover-search.constants";
import {
  getFavoriteMovers,
  getRecommendedMovers,
  MOCK_FAVORITE_MOVER_IDS,
} from "../mover-search.mock";

export function useMoverSearchRecommended(enabled: boolean) {
  return useQuery({
    queryKey: moverSearchQueryKeys.recommended(),
    queryFn: () => getRecommendedMovers(SIDEBAR_MOVER_LIMIT),
    enabled,
  });
}

export function useMoverSearchFavorites(
  userId: string | undefined,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const queryKey = moverSearchQueryKeys.favorites(userId ?? "anonymous");

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<string[]> => [...MOCK_FAVORITE_MOVER_IDS],
    enabled: Boolean(userId) && enabled,
  });

  const favoriteIds = useMemo(() => query.data ?? [], [query.data]);
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const movers = useMemo(
    () => getFavoriteMovers(favoriteIds, SIDEBAR_MOVER_LIMIT),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    (moverId: string) => {
      if (!userId) {
        return;
      }

      queryClient.setQueryData<string[]>(queryKey, (current) => {
        const ids = current ?? [...MOCK_FAVORITE_MOVER_IDS];
        return ids.includes(moverId)
          ? ids.filter((id) => id !== moverId)
          : [moverId, ...ids];
      });
    },
    [queryClient, queryKey, userId],
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
