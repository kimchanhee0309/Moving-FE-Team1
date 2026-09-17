"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { QUERY_KEY_ROOTS } from "@/common/constants/query-keys";

import {
  fetchReceivedRequests,
  rejectReceivedRequest,
  sendQuote,
} from "./mover-requests.api";

import type {
  ReceivedRequestsQuery,
  RejectRequestFormValue,
  SendQuoteFormValue,
} from "./mover-requests.types";

export const receivedRequestKeys = {
  all: QUERY_KEY_ROOTS.MOVER_RECEIVED_REQUESTS,

  list: (query: ReceivedRequestsQuery) =>
    [...QUERY_KEY_ROOTS.MOVER_RECEIVED_REQUESTS, "list", query] as const,
};

export function useReceivedRequests(query: ReceivedRequestsQuery) {
  return useInfiniteQuery({
    queryKey: receivedRequestKeys.list(query),

    queryFn: ({ pageParam, signal }) =>
      fetchReceivedRequests(
        {
          ...query,
          cursor: pageParam ?? undefined,
        },
        signal,
      ),

    initialPageParam: null as string | null,

    getNextPageParam: (lastPage) =>
      lastPage.paginateion.hasNext ? lastPage.paginateion.nextCursor : null,
  });
}

interface SendQuoteMutationVariables {
  requestId: string;
  value: SendQuoteFormValue;
}

export function useSendQuoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, value }: SendQuoteMutationVariables) =>
      sendQuote(requestId, value),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEY_ROOTS.MOVER_RECEIVED_REQUESTS,
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEY_ROOTS.MOVER_QUOTES,
        }),
      ]);
    },
  });
}

interface RejectRequestMutationVariables {
  requestId: string;
  value: RejectRequestFormValue;
}

export function useRejectReceivedRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, value }: RejectRequestMutationVariables) =>
      rejectReceivedRequest(requestId, value),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEY_ROOTS.MOVER_RECEIVED_REQUESTS,
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEY_ROOTS.MOVER_REJECTED_REQUESTS,
        }),
      ]);
    },
  });
}
