import type { ServiceType } from "@/common/constants/domain";

export interface MoverSearchResult {
  id: string;
  serviceType: ServiceType;
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

export interface MoverSearchPageResult {
  items: MoverSearchResult[];
  nextPage: number | undefined;
  totalCount: number;
}

export interface MoverDetail extends MoverSearchResult {
  serviceTypes: ServiceType[];
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

export interface MoverReviewSummary {
  reviews: MoverReview[];
  ratingCounts: MoverReviewRatingCount[];
}
