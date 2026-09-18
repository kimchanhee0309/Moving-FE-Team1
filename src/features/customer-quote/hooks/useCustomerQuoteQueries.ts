"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  confirmReceivedQuote,
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

/** hasNext인데 nextCursor가 pageParam과 같으면 같은 페이지를 반복 요청하게 되므로 실패 처리합니다. */
function assertCursorAdvanced(
  pageParam: string | undefined,
  pagination: { hasNext: boolean; nextCursor: string | null },
) {
  if (
    pagination.hasNext &&
    pagination.nextCursor != null &&
    pageParam != null &&
    pagination.nextCursor === pageParam
  ) {
    throw new Error("Pagination cursor did not advance");
  }
}

export function useReceivedQuotesQuery() {
  return useInfiniteQuery({
    queryKey: customerQuoteQueryKeys.pendingList(),
    queryFn: async ({ pageParam }) => {
      const result = await getReceivedQuotes({
        limit: LIST_PAGE_SIZE,
        cursor: pageParam,
      });
      assertCursorAdvanced(pageParam, result.pagination);
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
      assertCursorAdvanced(pageParam, result.pagination);
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

/**
 * 대기 견적 확정 mutation.
 * 성공 시 이력 상세 캐시를 채우고 대기·이력·활성 요청 쿼리를 무효화합니다.
 */
export function useConfirmReceivedQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quoteId: string) => {
      const result = await confirmReceivedQuote(quoteId);
      return mapQuoteDetail(result.quote);
    },
    onSuccess: async (quote) => {
      queryClient.setQueryData(
        customerQuoteQueryKeys.historyDetail(quote.id),
        quote,
      );
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: customerQuoteQueryKeys.pendingList(),
        }),
        queryClient.invalidateQueries({
          queryKey: customerQuoteQueryKeys.pendingDetail(quote.id),
        }),
        queryClient.invalidateQueries({
          queryKey: customerQuoteQueryKeys.historyList(),
        }),
        queryClient.invalidateQueries({
          queryKey: customerQuoteQueryKeys.activeMoveRequest(),
        }),
      ]);
    },
  });
}
