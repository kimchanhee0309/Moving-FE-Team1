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
