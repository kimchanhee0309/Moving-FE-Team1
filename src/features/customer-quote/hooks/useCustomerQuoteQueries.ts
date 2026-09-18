"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getActiveMoveRequest,
  getReceivedQuoteDetail,
  getReceivedQuoteHistory,
  getReceivedQuoteHistoryDetail,
  getReceivedQuotes,
} from "../api/customer-quote.api";
import { customerQuoteQueryKeys } from "../api/customer-quote.keys";
import {
  mapActiveMoveRequest,
  mapQuoteDetail,
  mapQuoteListItem,
} from "../api/customer-quote.mapper";

const LIST_PAGE_SIZE = 50;

function getNextCursor(pagination: {
  hasNext: boolean;
  nextCursor: string | null;
}) {
  if (!pagination.hasNext || !pagination.nextCursor) {
    return undefined;
  }
  return pagination.nextCursor;
}

export function useReceivedQuotesQuery() {
  return useInfiniteQuery({
    queryKey: customerQuoteQueryKeys.pendingList(),
    queryFn: async ({ pageParam }) => {
      const result = await getReceivedQuotes({
        limit: LIST_PAGE_SIZE,
        cursor: pageParam,
      });
      return {
        items: result.items.map(mapQuoteListItem),
        pagination: result.pagination,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pagination),
  });
}

export function useActiveMoveRequestQuery() {
  return useQuery({
    queryKey: customerQuoteQueryKeys.activeMoveRequest(),
    queryFn: async () => {
      const result = await getActiveMoveRequest();
      if (!result.moveRequest) {
        return null;
      }
      return mapActiveMoveRequest(result.moveRequest);
    },
  });
}

export function useReceivedQuoteDetailQuery(quoteId: string) {
  return useQuery({
    queryKey: customerQuoteQueryKeys.pendingDetail(quoteId),
    queryFn: async () => {
      const result = await getReceivedQuoteDetail(quoteId);
      return mapQuoteDetail(result.quote);
    },
    enabled: Boolean(quoteId),
  });
}

export function useReceivedQuoteHistoryQuery() {
  return useInfiniteQuery({
    queryKey: customerQuoteQueryKeys.historyList(),
    queryFn: async ({ pageParam }) => {
      const result = await getReceivedQuoteHistory({
        limit: LIST_PAGE_SIZE,
        cursor: pageParam,
      });
      return {
        items: result.items,
        pagination: result.pagination,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => getNextCursor(lastPage.pagination),
  });
}

export function useReceivedQuoteHistoryDetailQuery(quoteId: string) {
  return useQuery({
    queryKey: customerQuoteQueryKeys.historyDetail(quoteId),
    queryFn: async () => {
      const result = await getReceivedQuoteHistoryDetail(quoteId);
      return mapQuoteDetail(result.quote);
    },
    enabled: Boolean(quoteId),
  });
}
