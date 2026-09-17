"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getActiveMoveRequest,
  getReceivedQuoteDetail,
  getReceivedQuoteHistory,
  getReceivedQuoteHistoryDetail,
  getReceivedQuotes,
} from "../api/customer-quote.api";
import { customerQuoteQueryKeys } from "../api/customer-quote.keys";
import {
  groupHistoryQuotes,
  mapActiveMoveRequest,
  mapQuoteDetail,
  mapQuoteListItem,
} from "../api/customer-quote.mapper";

export function useReceivedQuotesQuery() {
  return useQuery({
    queryKey: customerQuoteQueryKeys.pendingList(),
    queryFn: async () => {
      const result = await getReceivedQuotes({ limit: 50 });
      return {
        items: result.items.map(mapQuoteListItem),
        pagination: result.pagination,
        rawItems: result.items,
      };
    },
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
  return useQuery({
    queryKey: customerQuoteQueryKeys.historyList(),
    queryFn: async () => {
      const result = await getReceivedQuoteHistory({ limit: 50 });
      return {
        groups: groupHistoryQuotes(result.items),
        pagination: result.pagination,
      };
    },
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
