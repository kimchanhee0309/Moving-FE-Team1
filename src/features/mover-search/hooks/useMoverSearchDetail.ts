"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { moverSearchQueryKeys } from "../mover-search.constants";
import {
  getMockMoverDetail,
  getMockMoverReviews,
  MOCK_CUSTOMER_HAS_GENERAL_QUOTE,
  MOCK_DESIGNATED_MOVER_IDS,
  readStoredDesignatedMoverIds,
  writeStoredDesignatedMoverIds,
} from "../mover-search.mock";

export function useMoverSearchDetail(moverId: string) {
  const detailQuery = useQuery({
    queryKey: moverSearchQueryKeys.detail(moverId),
    queryFn: () => getMockMoverDetail(moverId),
  });
  const reviewQuery = useQuery({
    queryKey: moverSearchQueryKeys.reviews(moverId),
    queryFn: () => getMockMoverReviews(moverId),
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

export function useMoverSearchDesignatedRequest(
  userId: string | undefined,
  enabled: boolean,
  hasGeneralQuoteOverride = false,
) {
  const queryClient = useQueryClient();
  const designatedKey = moverSearchQueryKeys.designated(userId ?? "anonymous");
  const quoteKey = moverSearchQueryKeys.generalQuote(userId ?? "anonymous");

  const designatedQuery = useQuery({
    queryKey: designatedKey,
    queryFn: async (): Promise<string[]> => readStoredDesignatedMoverIds(),
    enabled: Boolean(userId) && enabled,
  });
  const quoteQuery = useQuery({
    queryKey: quoteKey,
    queryFn: async () => MOCK_CUSTOMER_HAS_GENERAL_QUOTE,
    enabled: Boolean(userId) && enabled,
  });

  const designatedIdSet = useMemo(
    () => new Set(designatedQuery.data ?? []),
    [designatedQuery.data],
  );

  const completeDesignated = useCallback(
    (moverId: string) => {
      if (!userId) {
        return;
      }

      queryClient.setQueryData<string[]>(designatedKey, (current) => {
        const ids = current ?? [...MOCK_DESIGNATED_MOVER_IDS];
        const nextIds = ids.includes(moverId) ? ids : [...ids, moverId];
        writeStoredDesignatedMoverIds(nextIds);
        return nextIds;
      });
    },
    [designatedKey, queryClient, userId],
  );

  return {
    isPending: designatedQuery.isPending || quoteQuery.isPending,
    hasGeneralQuote: hasGeneralQuoteOverride || quoteQuery.data === true,
    designatedIdSet,
    completeDesignated,
  };
}
