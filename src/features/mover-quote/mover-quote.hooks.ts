"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { QuoteStatus } from "@/common/constants/domain";
import { QUERY_KEY_ROOTS } from "@/common/constants/query-keys";

import {
  fetchMoverQuoteDetail,
  fetchMoverQuotes,
  fetchRejectedRequests,
} from "./mover-quote.api";

export const moverQuoteKeys = {
  all: QUERY_KEY_ROOTS.MOVER_QUOTES,

  list: (status?: QuoteStatus) =>
    [...QUERY_KEY_ROOTS.MOVER_QUOTES, "list", { status }] as const,

  detail: (quoteId: string) =>
    [...QUERY_KEY_ROOTS.MOVER_QUOTES, "detail", quoteId] as const,

  rejected: QUERY_KEY_ROOTS.MOVER_REJECTED_REQUESTS,
};

export function useMoverQuotes(status?: QuoteStatus) {
  return useInfiniteQuery({
    queryKey: moverQuoteKeys.list(status),

    queryFn: ({ pageParam, signal }) =>
      fetchMoverQuotes(
        {
          status,
          cursor: pageParam ?? undefined,
          limit: 10,
        },
        signal,
      ),

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.nextCursor : null,
  });
}

export function useMoverQuoteDetail(quoteId: string) {
  return useQuery({
    queryKey: moverQuoteKeys.detail(quoteId),
    queryFn: ({ signal }) => fetchMoverQuoteDetail(quoteId, signal),
    enabled: quoteId.length > 0,
  });
}

export function useRejectedRequests() {
  return useInfiniteQuery({
    queryKey: moverQuoteKeys.rejected,

    queryFn: ({ pageParam, signal }) =>
      fetchRejectedRequests(
        {
          cursor: pageParam ?? undefined,
          limit: 10,
        },
        signal,
      ),

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.nextCursor : null,
  });
}
