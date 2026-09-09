import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

import type { MoverSearchSortValue } from "./mover-search.types";

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

export const SERVICE_FILTER_OPTIONS = Object.values(SERVICE_TYPE).map(
  (value) => ({
    value,
    label: SERVICE_TYPE_LABEL[value],
  }),
);

export const REGION_FILTER_OPTIONS = [
  { value: "seoul", label: "서울" },
  { value: "gyeonggi", label: "경기" },
  { value: "incheon", label: "인천" },
  { value: "gangwon", label: "강원" },
  { value: "chungbuk", label: "충북" },
  { value: "chungnam", label: "충남" },
  { value: "sejong", label: "세종" },
  { value: "daejeon", label: "대전" },
  { value: "jeonbuk", label: "전북" },
  { value: "jeonnam", label: "전남" },
  { value: "gwangju", label: "광주" },
  { value: "gyeongbuk", label: "경북" },
  { value: "gyeongnam", label: "경남" },
  { value: "daegu", label: "대구" },
  { value: "ulsan", label: "울산" },
  { value: "busan", label: "부산" },
  { value: "jeju", label: "제주" },
];

export const SORT_OPTIONS: { value: MoverSearchSortValue; label: string }[] = [
  { value: "reviewCount", label: "리뷰 많은순" },
  { value: "rating", label: "평점 높은순" },
  { value: "careerYears", label: "경력 많은순" },
  { value: "confirmedCount", label: "확정 많은순" },
];

export const DEFAULT_SORT_VALUE: MoverSearchSortValue = SORT_OPTIONS[0].value;

export const SIDEBAR_MOVER_LIMIT = 3;

export const MOVER_SEARCH_PAGE_SIZE = 5;

export const MOVER_SEARCH_SIDEBAR_TITLE = {
  recommended: "추천 기사님",
  favorite: "찜한 기사님",
} as const;

export const moverSearchQueryKeys = {
  all: ["mover-search"] as const,
  list: (params: {
    search: string;
    regions: readonly string[];
    services: readonly string[];
    sort: MoverSearchSortValue;
  }) => [...moverSearchQueryKeys.all, "list", params] as const,
  recommended: () => [...moverSearchQueryKeys.all, "recommended"] as const,
  favorites: (userId: string) =>
    [...moverSearchQueryKeys.all, "favorites", userId] as const,
};
