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
import type {
  FavoriteListResult,
  FavoriteMover,
} from "@/features/favorite/favorite.types";

import { fetchRecommendedMovers } from "../mover-search.api";
import { moverSearchQueryKeys } from "../mover-search.constants";
import { mapFavoriteMoverToSearchResult } from "../mover-search.mapper";
import type { MoverDetail, MoverSearchResult } from "../mover-search.types";

/**
 * 찜 토글에 필요한 최소 필드입니다. 목록 카드(`MoverSearchResult`)·상세(`MoverDetail`)가
 * 구조적으로 이 타입을 만족해, 호출부는 이미 들고 있는 객체를 그대로 넘기면 됩니다.
 */
export type FavoriteToggleTarget = Pick<
  MoverSearchResult,
  | "id"
  | "serviceType"
  | "serviceTypes"
  | "moverName"
  | "introduction"
  | "description"
  | "profileImageUrl"
  | "rating"
  | "reviewCount"
  | "careerYears"
  | "confirmedCount"
  | "favoriteCount"
>;

function toFavoriteMoverEntry(
  mover: FavoriteToggleTarget,
  nextFavoriteCount: number,
): FavoriteMover {
  return {
    id: mover.id,
    serviceType: mover.serviceType,
    serviceTypes: mover.serviceTypes,
    moverName: mover.moverName,
    introduction: mover.introduction,
    description: mover.description,
    profileImageUrl: mover.profileImageUrl,
    rating: mover.rating,
    reviewCount: mover.reviewCount,
    careerYears: mover.careerYears,
    confirmedCount: mover.confirmedCount,
    favoriteCount: nextFavoriteCount,
  };
}

export function useMoverSearchRecommended(enabled: boolean) {
  return useQuery({
    queryKey: moverSearchQueryKeys.recommended(),
    queryFn: ({ signal }) => fetchRecommendedMovers(signal),
    enabled,
  });
}

/**
 * 로그인 일반 유저의 찜 id·사이드바 카드입니다. 1페이지(최대 50명)를 한 번에 받아 두고,
 * `movers`는 전체를 돌려줍니다 — 3명 단위 표시는 사이드바가 페이지네이션으로 처리합니다.
 * 등록/해제는 favorite API를 쓰고 `/favorite` 목록 캐시도 함께 무효화합니다.
 */
export function useMoverSearchFavorites(
  userId: string | undefined,
  enabled: boolean,
  onToggled?: (isFavorite: boolean) => void,
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

  const favoriteMovers = useMemo(() => query.data?.items ?? [], [query.data]);
  const favoriteIds = useMemo(
    () => favoriteMovers.map((mover) => mover.id),
    [favoriteMovers],
  );
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  // 3명으로 자르지 않고 전체를 돌려줍니다. 사이드바가 3명 단위로 페이지네이션합니다.
  const movers = useMemo(
    () => favoriteMovers.map(mapFavoriteMoverToSearchResult),
    [favoriteMovers],
  );

  const toggleMutation = useMutation({
    mutationFn: async (mover: FavoriteToggleTarget) => {
      const wasFavorite = favoriteIdSet.has(mover.id);

      if (wasFavorite) {
        try {
          await removeFavoriteMover(mover.id);
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 404)) {
            throw error;
          }
        }
      } else {
        try {
          await addFavoriteMover(mover.id);
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 409)) {
            throw error;
          }
        }
      }

      return { mover, wasFavorite };
    },
    // 토글 1건은 POST/DELETE 요청 1번이면 충분하다. 성공 후 이 화면이 바로 쓰는 캐시(내 찜
    // id 목록, 상세에 보이는 favoriteCount)는 서버에 다시 묻지 않고 결과로 직접 패치하고,
    // 지금 화면에 없는 캐시(찜 전체 목록·목록 검색·추천)는 refetchType:"none"으로 stale
    // 표시만 해 다음에 열릴 때 새로 받는다 — 즉시 추가 요청(원래 3건 → 1건)을 만들지 않는다.
    onSuccess: ({ mover, wasFavorite }) => {
      const willBeFavorite = !wasFavorite;
      const favoriteCountDelta = willBeFavorite ? 1 : -1;

      queryClient.setQueryData<FavoriteListResult>(queryKey, (current) => {
        if (!current) {
          return current;
        }
        if (!willBeFavorite) {
          return {
            ...current,
            items: current.items.filter((item) => item.id !== mover.id),
          };
        }
        if (current.items.some((item) => item.id === mover.id)) {
          return current;
        }
        return {
          ...current,
          items: [
            toFavoriteMoverEntry(
              mover,
              Math.max(0, mover.favoriteCount + favoriteCountDelta),
            ),
            ...current.items,
          ],
        };
      });

      queryClient.setQueriesData<MoverDetail>(
        { queryKey: [...moverSearchQueryKeys.all, "detail"] },
        (current) => {
          if (!current || current.id !== mover.id) {
            return current;
          }
          return {
            ...current,
            favoriteCount: Math.max(
              0,
              current.favoriteCount + favoriteCountDelta,
            ),
          };
        },
      );

      void queryClient.invalidateQueries({
        queryKey: favoriteKeys.lists(),
        refetchType: "none",
      });
      void queryClient.invalidateQueries({
        queryKey: [...moverSearchQueryKeys.all, "list"],
        refetchType: "none",
      });
      void queryClient.invalidateQueries({
        queryKey: moverSearchQueryKeys.recommended(),
        refetchType: "none",
      });

      onToggled?.(willBeFavorite);
    },
  });

  const toggleFavorite = useCallback(
    (mover: FavoriteToggleTarget) => {
      if (!userId || toggleMutation.isPending) {
        return;
      }

      toggleMutation.mutate(mover);
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
