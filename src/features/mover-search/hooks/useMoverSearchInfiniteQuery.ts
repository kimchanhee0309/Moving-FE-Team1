"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { moverSearchQueryKeys } from "../mover-search.constants";
import { queryMockMoverSearchPage } from "../mover-search.mock";
import type { MoverSearchListParams } from "../mover-search.types";

export function useMoverSearchInfiniteQuery(params: MoverSearchListParams) {
  return useInfiniteQuery({
    queryKey: moverSearchQueryKeys.list(params),
    queryFn: ({ pageParam }) => queryMockMoverSearchPage(params, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
