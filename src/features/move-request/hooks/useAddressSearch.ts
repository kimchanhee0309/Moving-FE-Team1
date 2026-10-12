import { useQuery } from "@tanstack/react-query";

import type { AddressResult } from "@/common/components/AddressCard";

import { searchAddress } from "../api/address-search.api";
import { addressSearchKeys } from "../constants/address-search.constants";

export interface UseAddressSearchResult {
  /** 마지막으로 제출(Enter/돋보기)된 검색어 기준 도로명주소 검색 결과입니다. */
  results: AddressResult[];
  /** 검색 요청이 진행 중이면 true입니다. 빈 검색어일 때는 항상 false입니다. */
  isLoading: boolean;
}

/**
 * `AddressSearchModal`은 검색 API를 직접 호출하지 않는 controlled 컴포넌트이므로, 이 hook이
 * 행정안전부 도로명주소 API 프록시(`/api/address/search`) 호출을 책임집니다.
 *
 * `submittedQuery`는 사용자가 타이핑 중인 값이 아니라, Enter 또는 돋보기 버튼으로 검색을
 * 명시적으로 제출했을 때만 갱신되는 값이어야 한다(호출부인 `MoveRequestFlow`가 관리) — 그래서
 * 이 hook 자체는 debounce를 하지 않는다. 타이핑마다 API를 호출하지 않기 위한 정책이며,
 * 공백만 있거나 빈 문자열이면 쿼리를 비활성화해 호출하지 않는다.
 */
export function useAddressSearch(submittedQuery: string): UseAddressSearchResult {
  const trimmedQuery = submittedQuery.trim();
  const isQueryEnabled = trimmedQuery.length > 0;

  const { data, isFetching } = useQuery({
    queryKey: addressSearchKeys.search(trimmedQuery),
    queryFn: () => searchAddress(trimmedQuery),
    enabled: isQueryEnabled,
    staleTime: 60 * 1000,
  });

  return {
    results: data ?? [],
    isLoading: isQueryEnabled && isFetching,
  };
}
