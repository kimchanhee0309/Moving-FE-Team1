"use client";

/**
 * 기사님 견적 관리 API를 TanStack Query와 연결함
 *
 * 담당 기능:
 * - query key 생성
 * - cursor pagination 연결
 * - AbsortSignal 전달
 * - 견적 상세 캐시 관리
 *
 * API 응답 검증과 화면 렌더링은 각각 API 파일과 컴포넌트가 담당
 */

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import type { QuoteStatus } from "@/common/constants/domain";
import { QUERY_KEY_ROOTS } from "@/common/constants/query-keys";

import {
  fetchMoverQuoteDetail,
  fetchMoverQuotes,
  fetchRejectedRequests,
} from "./mover-quote.api";

/**
 * 기사님 견적 관련 Query Key factory
 *
 * 목록 status와 상세 quoteId를 key에 포함하여 서로 다른 서버 상태가
 * 같은 캐시를 공유하지 않도록 함
 */
export const moverQuoteKeys = {
  all: QUERY_KEY_ROOTS.MOVER_QUOTES,

  list: (status?: QuoteStatus) =>
    [...QUERY_KEY_ROOTS.MOVER_QUOTES, "list", { status }] as const,

  detail: (quoteId: string) =>
    [...QUERY_KEY_ROOTS.MOVER_QUOTES, "detail", quoteId] as const,

  rejected: QUERY_KEY_ROOTS.MOVER_REJECTED_REQUESTS,
};

/**
 * 기사님의 보낸 견적 목록을 조회
 *
 * 다음 cursor는 서버 pagination이 hasNext=true일 때만 반환
 */
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

/**
 * 견적 상세를 quoteId별로 조회
 *
 * 비어 있는 quoteId로 잘못된 API 요청이 나가지 않도록 enabled를 함께 설정
 */
export function useMoverQuoteDetail(quoteId: string) {
  return useQuery({
    queryKey: moverQuoteKeys.detail(quoteId),
    queryFn: ({ signal }) => fetchMoverQuoteDetail(quoteId, signal),
    enabled: quoteId.length > 0,
  });
}

/** 기사님이 직접 반려한 요청 목록을 cursor 방식으로 조회 */
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
