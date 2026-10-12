/**
 * 주소 검색(useAddressSearch) query key factory입니다. debounce된 검색어별로 캐시를
 * 분리해서 이전 검색어 결과와 섞이지 않게 합니다.
 */
export const addressSearchKeys = {
  all: ["move-request", "address-search"] as const,
  search: (query: string) => [...addressSearchKeys.all, query] as const,
};
