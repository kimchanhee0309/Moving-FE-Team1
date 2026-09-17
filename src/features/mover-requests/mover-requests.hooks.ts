"use client";

/**
 * 받은 요청의 TanStack Query/Mutation 상태를 관리
 *
 * API 호출 자체는 mover-requests.api.ts에 위임하고,
 * 이 파일은 query key, cursor pagination, mutation 이후 캐시 무효화를 담당
 */
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

/** 받은 요청 Query가 사용하는 Key factory */
export const receivedRequestKeys = {
  all: QUERY_KEY_ROOTS.MOVER_RECEIVED_REQUESTS,

  /** 검색,필터,정렬 조건이 다르면 서로 다른 캐시로 관리 */
  list: (query: ReceivedRequestsQuery) =>
    [...QUERY_KEY_ROOTS.MOVER_RECEIVED_REQUESTS, "list", query] as const,
};

/**
 * 받은 요청 목록을 Cursor 방식으로 조회
 *
 * 첫 페이지의 cursor는 null이며 마지막 응답의 nextCursor를
 * 다음 요청의 pageParam으로 사용
 */
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

/**
 * 견적 보내기 mutation
 *
 * 성공하면:
 * - 처리한 요청이 받은 요청 목록에서 제거되도록 목록 캐시를 무효화함
 * - 새 견적이 보낸 견적 목록에 표시되도록 견적 캐시를 무효화함
 */
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

/**
 * 받은 요청 반려 mutation
 *
 * 성공하면:
 * - 해당 요청을 받은 요청 목록에서 제거
 * - 반려 요청 목록에 새 반려 기록이 나타나도록 캐시를 무효화
 */
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
