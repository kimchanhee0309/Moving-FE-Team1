import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

import type {
  MoverReviewRatingCount,
  MoverSearchSortValue,
} from "./mover-search.types";

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
] as const;

/** UI 필터 slug(`seoul`) → `GET /movers` `regions` 한글 값(`서울`). BE `MOVER_REGIONS`와 동일합니다. */
export const REGION_SLUG_TO_API_VALUE: Readonly<Record<string, string>> =
  Object.fromEntries(
    REGION_FILTER_OPTIONS.map((option) => [option.value, option.label]),
  );

export const SORT_OPTIONS: { value: MoverSearchSortValue; label: string }[] = [
  { value: "reviewCount", label: "리뷰 많은순" },
  { value: "rating", label: "평점 높은순" },
  { value: "careerYears", label: "경력 많은순" },
  { value: "confirmedCount", label: "확정 많은순" },
];

export const DEFAULT_SORT_VALUE: MoverSearchSortValue = SORT_OPTIONS[0].value;

export const SIDEBAR_MOVER_LIMIT = 3;

export const MOVER_SEARCH_PAGE_SIZE = 5;

export const MOVER_SEARCH_DEBOUNCE_MS = 300;

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
  detail: (moverId: string) =>
    [...moverSearchQueryKeys.all, "detail", moverId] as const,
  reviews: (moverId: string, page: number) =>
    [...moverSearchQueryKeys.all, "reviews", moverId, page] as const,
  designated: (userId: string) =>
    [...moverSearchQueryKeys.all, "designated", userId] as const,
};

export const MOVER_DETAIL_REVIEW_PAGE_SIZE = 5;

/** BE 리뷰 summary에 별점 분포가 없어 상세 진행 바는 0으로 둡니다. */
export const EMPTY_MOVER_REVIEW_RATING_COUNTS: MoverReviewRatingCount[] = [
  { score: 5, count: 0 },
  { score: 4, count: 0 },
  { score: 3, count: 0 },
  { score: 2, count: 0 },
  { score: 1, count: 0 },
];

export function createMoverDetailShareUrl(origin: string, detailHref: string) {
  return `${origin}${detailHref}`;
}

export function createKakaoShareUrl(detailUrl: string) {
  return `https://story.kakao.com/s/share?url=${encodeURIComponent(detailUrl)}`;
}
