"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchMoverSearchPage } from "../mover-search.api";
import { moverSearchQueryKeys } from "../mover-search.constants";
import type { MoverSearchListParams } from "../mover-search.types";

/**
 * 기사님 찾기 목록 무한 스크롤입니다. query key에 검색·필터·정렬을 넣어 조건이 바뀌면
 * 1페이지부터 다시 조회합니다. BE `nextPage`가 `null`이면 다음 페이지가 없습니다.
 * 조건 변경·언마운트 시 `signal`로 이전 `/movers` 요청을 취소합니다.
 */
export function useMoverSearchInfiniteQuery(params: MoverSearchListParams) {
  return useInfiniteQuery({
    queryKey: moverSearchQueryKeys.list(params),
    queryFn: ({ pageParam, signal }) =>
      fetchMoverSearchPage(params, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
