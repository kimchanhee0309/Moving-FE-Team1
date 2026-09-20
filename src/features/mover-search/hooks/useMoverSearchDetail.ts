"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { ApiError } from "@/common/api/error";
import { moveRequestKeys } from "@/features/move-request/constants/move-request.constants";
import {
  createDesignatedRequest,
  fetchActiveMoveRequest,
} from "@/features/move-request/move-request.api";

import { fetchMoverDetail, fetchMoverReviews } from "../mover-search.api";
import { moverSearchQueryKeys } from "../mover-search.constants";

export function useMoverSearchDetail(moverId: string, reviewPage: number) {
  const detailQuery = useQuery({
    queryKey: moverSearchQueryKeys.detail(moverId),
    queryFn: ({ signal }) => fetchMoverDetail(moverId, signal),
    enabled: moverId.length > 0,
  });
  const reviewQuery = useQuery({
    queryKey: moverSearchQueryKeys.reviews(moverId, reviewPage),
    queryFn: ({ signal }) => fetchMoverReviews(moverId, reviewPage, signal),
    enabled: moverId.length > 0,
    placeholderData: keepPreviousData,
  });

  return {
    mover: detailQuery.data ?? null,
    isDetailPending: detailQuery.isPending,
    isDetailError: detailQuery.isError,
    refetchDetail: detailQuery.refetch,
    reviewSummary: reviewQuery.data,
    isReviewPending: reviewQuery.isPending,
    isReviewError: reviewQuery.isError,
    refetchReviews: reviewQuery.refetch,
  };
}

/**
 * 지정 견적은 활성 일반 요청이 있을 때만 POST합니다.
 * 지정된 기사님 목록 API가 없어 완료 표시는 이번 세션의 성공·이미 지정(409)만 반영합니다.
 */
export function useMoverSearchDesignatedRequest(
  userId: string | undefined,
  enabled: boolean,
  hasGeneralQuoteOverride = false,
) {
  const queryClient = useQueryClient();
  const designatedKey = moverSearchQueryKeys.designated(userId ?? "anonymous");

  const designatedQuery = useQuery({
    queryKey: designatedKey,
    queryFn: async (): Promise<string[]> => [],
    enabled: Boolean(userId) && enabled,
    initialData: [],
    staleTime: Infinity,
  });
  const activeQuery = useQuery({
    queryKey: moveRequestKeys.active(),
    queryFn: fetchActiveMoveRequest,
    select: (data) => data.moveRequest,
    enabled: Boolean(userId) && enabled,
  });

  const designatedIdSet = useMemo(
    () => new Set(designatedQuery.data ?? []),
    [designatedQuery.data],
  );

  const markDesignated = useCallback(
    (moverId: string) => {
      queryClient.setQueryData<string[]>(designatedKey, (current) => {
        const ids = current ?? [];
        return ids.includes(moverId) ? ids : [...ids, moverId];
      });
    },
    [designatedKey, queryClient],
  );

  const designatedMutation = useMutation({
    mutationFn: async (moverId: string) => {
      const moveRequest = activeQuery.data;
      if (!moveRequest) {
        throw new ApiError(
          409,
          "MOVE_REQUEST_NOT_FOUND",
          "일반 견적 요청이 있어야 지정 요청을 보낼 수 있습니다.",
        );
      }

      try {
        await createDesignatedRequest(moveRequest.id, moverId);
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.code === "DESIGNATED_REQUEST_ALREADY_EXISTS"
        ) {
          return;
        }
        throw error;
      }
    },
    onSuccess: (_data, moverId) => {
      markDesignated(moverId);
    },
  });

  const completeDesignated = useCallback(
    (moverId: string) => {
      if (!userId || designatedMutation.isPending) {
        return;
      }

      designatedMutation.mutate(moverId);
    },
    [designatedMutation, userId],
  );

  return {
    isPending: designatedQuery.isPending || activeQuery.isPending,
    hasGeneralQuote: hasGeneralQuoteOverride || Boolean(activeQuery.data),
    designatedIdSet,
    completeDesignated,
  };
}
