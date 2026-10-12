import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { ApiError } from "@/common/api/error";
import type { Pagination } from "@/common/api/types";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

import type {
  FavoriteItemDto,
  FavoriteListDto,
  FavoriteMover,
  FavoriteMoverDto,
} from "./favorite.types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isServiceType(value: unknown): value is ServiceType {
  return (
    value === SERVICE_TYPE.SMALL ||
    value === SERVICE_TYPE.HOME ||
    value === SERVICE_TYPE.OFFICE
  );
}

function readPagination(value: unknown): Pagination {
  if (
    !isRecord(value) ||
    typeof value.page !== "number" ||
    typeof value.pageSize !== "number" ||
    typeof value.totalCount !== "number" ||
    typeof value.totalPages !== "number"
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "찜 목록 페이지 정보가 올바르지 않습니다.",
    );
  }

  return {
    page: value.page,
    pageSize: value.pageSize,
    totalCount: value.totalCount,
    totalPages: value.totalPages,
  };
}

function readFavoriteMover(value: unknown): FavoriteMoverDto {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.nickname !== "string" ||
    !(value.profileImageUrl === null || typeof value.profileImageUrl === "string") ||
    typeof value.careerYears !== "number" ||
    typeof value.shortIntroduction !== "string" ||
    !Array.isArray(value.serviceTypes) ||
    !value.serviceTypes.every((item) => typeof item === "string") ||
    !Array.isArray(value.regions) ||
    !value.regions.every((item) => typeof item === "string") ||
    typeof value.reviewCount !== "number" ||
    !(value.averageRating === null || typeof value.averageRating === "number") ||
    typeof value.favoriteCount !== "number"
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "찜한 기사님 카드 응답이 올바르지 않습니다.",
    );
  }

  return {
    id: value.id,
    nickname: value.nickname,
    profileImageUrl: value.profileImageUrl,
    careerYears: value.careerYears,
    shortIntroduction: value.shortIntroduction,
    serviceTypes: value.serviceTypes,
    regions: value.regions,
    reviewCount: value.reviewCount,
    averageRating: value.averageRating,
    favoriteCount: value.favoriteCount,
  };
}

function readFavoriteItem(value: unknown): FavoriteItemDto {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.moverId !== "string" ||
    typeof value.createdAt !== "string"
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "찜 목록 항목 응답이 올바르지 않습니다.",
    );
  }

  return {
    id: value.id,
    moverId: value.moverId,
    createdAt: value.createdAt,
    mover: readFavoriteMover(value.mover),
  };
}

/** apiClient가 벗긴 GET /favorites data를 검증합니다. */
export function readFavoriteList(data: unknown): FavoriteListDto {
  if (!isRecord(data) || !Array.isArray(data.items)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "찜 목록 응답이 올바르지 않습니다.",
    );
  }

  return {
    items: data.items.map(readFavoriteItem),
    pagination: readPagination(data.pagination),
  };
}

/**
 * FavoriteMoverDto → 카드 뷰 모델.
 * serviceTypes가 비거나 알 수 없으면 SMALL로 두고, confirmedCount는 API에 없어 0입니다.
 */
export function mapFavoriteMoverToCard(mover: FavoriteMoverDto): FavoriteMover {
  const owned = new Set(mover.serviceTypes.filter(isServiceType));
  const serviceTypes = [
    SERVICE_TYPE.SMALL,
    SERVICE_TYPE.HOME,
    SERVICE_TYPE.OFFICE,
  ].filter((serviceType) => owned.has(serviceType));
  const serviceType = serviceTypes[0] ?? SERVICE_TYPE.SMALL;

  return {
    id: mover.id,
    serviceType,
    serviceTypes: serviceTypes.length > 0 ? serviceTypes : [serviceType],
    moverName: mover.nickname,
    introduction: mover.shortIntroduction,
    // API에 상세 소개가 없어 한줄 소개를 재사용합니다.
    description: mover.shortIntroduction,
    // BE는 상대 경로(`/uploads/...`)를 줄 수 있어 API origin으로 변환합니다.
    profileImageUrl: resolveApiAssetUrl(mover.profileImageUrl),
    rating: mover.averageRating ?? 0,
    reviewCount: mover.reviewCount,
    careerYears: mover.careerYears,
    confirmedCount: 0,
    favoriteCount: mover.favoriteCount,
  };
}

export function mapFavoriteListToMovers(
  list: FavoriteListDto,
): FavoriteMover[] {
  return list.items.map((item) => mapFavoriteMoverToCard(item.mover));
}
