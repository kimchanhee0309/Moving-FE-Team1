import type { ServiceType } from "@/common/constants/domain";
import type { Pagination } from "@/common/api/types";

/** GET /favorites 응답의 기사님 카드 DTO입니다. */
export interface FavoriteMoverDto {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  careerYears: number;
  shortIntroduction: string;
  serviceTypes: string[];
  regions: string[];
  reviewCount: number;
  averageRating: number | null;
  favoriteCount: number;
}

/** GET /favorites items 요소 — Favorite 엔티티 + 기사님 카드 */
export interface FavoriteItemDto {
  id: string;
  moverId: string;
  createdAt: string;
  mover: FavoriteMoverDto;
}

export interface FavoriteListDto {
  items: FavoriteItemDto[];
  pagination: Pagination;
}

export interface FavoriteListParams {
  page?: number;
  pageSize?: number;
}

/** GET /favorites 한 페이지 조회 결과입니다. */
export interface FavoriteListResult {
  items: FavoriteMover[];
  pagination: Pagination;
}

/**
 * 찜 목록 화면용 뷰 모델입니다.
 * MoverSearchCard props에 맞추며, API에 없는 confirmedCount는 0입니다.
 * serviceTypes는 찾기 사이드바 칩용이고, FavoritePage는 대표 serviceType만 씁니다.
 */
export interface FavoriteMover {
  id: string;
  serviceType: ServiceType;
  serviceTypes: ServiceType[];
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
