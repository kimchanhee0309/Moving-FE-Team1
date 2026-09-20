import type { ServiceType } from "@/common/constants/domain";

export interface MoverSearchResult {
  id: string;
  serviceType: ServiceType;
  serviceTypes: ServiceType[];
  region: string;
  moverName: string;
  introduction: string;
  description: string;
  profileImageUrl?: string | null;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
}

export type MoverSearchSortValue =
  | "reviewCount"
  | "rating"
  | "careerYears"
  | "confirmedCount";

export type MoverSearchSidebarVariant = "recommended" | "favorite";

export type MoverSearchViewer = "pending" | "guest" | "customer" | "mover";

export interface MoverSearchListParams {
  search: string;
  regions: string[];
  services: string[];
  sort: MoverSearchSortValue;
}

/**
 * `GET /movers` 목록 카드 DTO입니다. Moving BE `mover-search.dto.ts`의 `MoverSearchItemDto`와
 * 같으며, 찜 여부·리뷰 본문은 포함하지 않습니다.
 */
export interface MoverSearchItemDto {
  id: string;
  serviceType: ServiceType;
  serviceTypes: ServiceType[];
  region: string;
  moverName: string;
  introduction: string;
  description: string;
  profileImageUrl: string | null;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
}

/**
 * `GET /movers` 성공 `data`입니다. `nextPage`는 다음 page 번호이고, 없으면 `null`입니다.
 */
export interface MoverSearchListDto {
  items: MoverSearchItemDto[];
  nextPage: number | null;
  totalCount: number;
}

export interface MoverSearchPageResult {
  items: MoverSearchResult[];
  nextPage: number | null;
  totalCount: number;
}

export interface MoverDetail extends MoverSearchResult {
  regionValues: string[];
  detailDescription: string;
}

export interface MoverReview {
  id: string;
  reviewerName: string;
  writtenAt: string;
  rating: number;
  content: string;
}

export interface MoverReviewRatingCount {
  score: 1 | 2 | 3 | 4 | 5;
  count: number;
}

/** `GET /movers/:id` 성공 `data.mover`입니다. `serviceTypes`는 목록 카드와 같습니다. */
export interface MoverSearchDetailDto extends MoverSearchItemDto {
  regions: string[];
}

/** `GET /movers/recommended` 성공 `data`입니다. */
export interface MoverSearchRecommendedDto {
  items: MoverSearchItemDto[];
}

/** `GET /movers/:moverId/reviews` 카드 DTO입니다. */
export interface MoverReceivedReviewDto {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  serviceType: string;
  customer: {
    id: string;
    name: string;
    profileImageUrl: string | null;
  };
}

export interface MoverReviewSummary {
  reviews: MoverReview[];
  ratingCounts: MoverReviewRatingCount[];
  totalCount: number;
  totalPages: number;
  averageRating: number;
}
