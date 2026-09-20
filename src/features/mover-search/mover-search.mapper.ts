import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { ApiError } from "@/common/api/error";
import type { Pagination } from "@/common/api/types";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";
import type { FavoriteMover } from "@/features/favorite/favorite.types";

import {
  EMPTY_MOVER_REVIEW_RATING_COUNTS,
  MOVER_SEARCH_PAGE_SIZE,
  REGION_SLUG_TO_API_VALUE,
} from "./mover-search.constants";
import type {
  MoverDetail,
  MoverReceivedReviewDto,
  MoverReview,
  MoverReviewRatingCount,
  MoverReviewSummary,
  MoverSearchDetailDto,
  MoverSearchItemDto,
  MoverSearchListDto,
  MoverSearchListParams,
  MoverSearchPageResult,
  MoverSearchRecommendedDto,
  MoverSearchResult,
} from "./mover-search.types";

/**
 * 기사님 찾기 목록 쿼리·응답 변환입니다. UI 지역 필터는 slug이고 BE는 한글 쉼표 문자열을
 * 받습니다. `apiClient.query`는 배열을 직렬화하지 않으므로 regions/services는 쉼표로 붙입니다.
 */

function isServiceType(value: unknown): value is ServiceType {
  return (
    value === SERVICE_TYPE.SMALL ||
    value === SERVICE_TYPE.HOME ||
    value === SERVICE_TYPE.OFFICE
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isMoverSearchItemDto(value: unknown): value is MoverSearchItemDto {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isServiceType(value.serviceType) &&
    Array.isArray(value.serviceTypes) &&
    value.serviceTypes.length > 0 &&
    value.serviceTypes.every(isServiceType) &&
    isNonEmptyString(value.region) &&
    isNonEmptyString(value.moverName) &&
    typeof value.introduction === "string" &&
    typeof value.description === "string" &&
    (value.profileImageUrl === null ||
      typeof value.profileImageUrl === "string") &&
    isFiniteNumber(value.rating) &&
    isNonNegativeInteger(value.reviewCount) &&
    isNonNegativeInteger(value.careerYears) &&
    isNonNegativeInteger(value.confirmedCount) &&
    isNonNegativeInteger(value.favoriteCount)
  );
}

function isMoverSearchListDto(value: unknown): value is MoverSearchListDto {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return false;
  }

  const isNextPageValid =
    value.nextPage === null || isPositiveInteger(value.nextPage);

  return (
    value.items.every(isMoverSearchItemDto) &&
    isNextPageValid &&
    isNonNegativeInteger(value.totalCount)
  );
}

function mapMoverSearchItem(item: MoverSearchItemDto): MoverSearchResult {
  return {
    id: item.id,
    serviceType: item.serviceType,
    serviceTypes: item.serviceTypes,
    region: item.region,
    moverName: item.moverName,
    introduction: item.introduction,
    description: item.description,
    profileImageUrl: resolveApiAssetUrl(item.profileImageUrl),
    rating: item.rating,
    reviewCount: item.reviewCount,
    careerYears: item.careerYears,
    confirmedCount: item.confirmedCount,
    favoriteCount: item.favoriteCount,
  };
}

/** 목록 화면 필터를 `GET /movers` query string 값으로 바꿉니다. 빈 조건은 보내지 않습니다. */
export function toMoverSearchListQuery(
  params: MoverSearchListParams,
  page: number,
) {
  const search = params.search.trim();
  const regions = params.regions
    .map((slug) => REGION_SLUG_TO_API_VALUE[slug])
    .filter((label): label is string => Boolean(label));
  const services = params.services.filter(isServiceType);

  return {
    search: search.length > 0 ? search : undefined,
    regions: regions.length > 0 ? regions.join(",") : undefined,
    services: services.length > 0 ? services.join(",") : undefined,
    sort: params.sort,
    page,
    pageSize: MOVER_SEARCH_PAGE_SIZE,
  };
}

/** apiClient가 벗긴 `GET /movers` data를 화면용 페이지 결과로 검증·변환합니다. */
export function mapMoverSearchListResult(
  data: unknown,
): MoverSearchPageResult {
  if (!isMoverSearchListDto(data)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "기사님 목록 응답 형식이 올바르지 않습니다.",
    );
  }

  return {
    items: data.items.map(mapMoverSearchItem),
    nextPage: data.nextPage,
    totalCount: data.totalCount,
  };
}

function isMoverSearchRecommendedDto(
  value: unknown,
): value is MoverSearchRecommendedDto {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isMoverSearchItemDto)
  );
}

function isMoverSearchDetailDto(value: unknown): value is MoverSearchDetailDto {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.regions) &&
    value.regions.every(isNonEmptyString) &&
    isMoverSearchItemDto(value)
  );
}

function isPagination(value: unknown): value is Pagination {
  return (
    isRecord(value) &&
    isPositiveInteger(value.page) &&
    isPositiveInteger(value.pageSize) &&
    isNonNegativeInteger(value.totalCount) &&
    isNonNegativeInteger(value.totalPages)
  );
}

function isMoverReceivedReviewDto(
  value: unknown,
): value is MoverReceivedReviewDto {
  if (!isRecord(value) || !isRecord(value.customer)) {
    return false;
  }

  const customer = value.customer;

  return (
    isNonEmptyString(value.id) &&
    isPositiveInteger(value.rating) &&
    value.rating <= 5 &&
    typeof value.content === "string" &&
    isNonEmptyString(value.createdAt) &&
    typeof value.serviceType === "string" &&
    isNonEmptyString(customer.id) &&
    isNonEmptyString(customer.name) &&
    (customer.profileImageUrl === null ||
      typeof customer.profileImageUrl === "string")
  );
}

function formatReviewWrittenAt(createdAt: string) {
  return createdAt.slice(0, 10).replaceAll("-", ".");
}

function mapMoverReceivedReview(item: MoverReceivedReviewDto): MoverReview {
  return {
    id: item.id,
    reviewerName: item.customer.name,
    writtenAt: formatReviewWrittenAt(item.createdAt),
    rating: item.rating,
    content: item.content,
  };
}

/** 공개 리뷰 API에 ratingCounts가 없어, 한 페이지에 전체가 오면 items로 점수 분포를 만듭니다. */
function toRatingCountsFromReviews(
  items: MoverReceivedReviewDto[],
): MoverReviewRatingCount[] {
  const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  items.forEach((item) => {
    if (item.rating === 1 || item.rating === 2 || item.rating === 3 || item.rating === 4 || item.rating === 5) {
      counts[item.rating] += 1;
    }
  });

  return ([5, 4, 3, 2, 1] as const).map((score) => ({
    score,
    count: counts[score],
  }));
}

/** apiClient가 벗긴 `GET /movers/recommended` data를 카드 목록으로 검증·변환합니다. */
export function mapMoverSearchRecommendedResult(
  data: unknown,
): MoverSearchResult[] {
  if (!isMoverSearchRecommendedDto(data)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "추천 기사님 응답 형식이 올바르지 않습니다.",
    );
  }

  return data.items.map(mapMoverSearchItem);
}

/** apiClient가 벗긴 `GET /movers/:id` data를 상세 화면 모델로 검증·변환합니다. */
export function mapMoverSearchDetailResult(data: unknown): MoverDetail {
  if (!isRecord(data) || !isMoverSearchDetailDto(data.mover)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "기사님 상세 응답 형식이 올바르지 않습니다.",
    );
  }

  const mover = data.mover;
  const regionValues =
    mover.regions.length > 0 ? mover.regions : [mover.region];

  return {
    ...mapMoverSearchItem(mover),
    regionValues,
    // 상세 전용 긴 소개 필드가 없어 목록 description을 본문에 사용합니다.
    detailDescription: mover.description,
  };
}

/** apiClient가 벗긴 `GET /movers/:moverId/reviews` data를 상세 리뷰 페이지로 검증·변환합니다. */
export function mapMoverReviewPageResult(data: unknown): MoverReviewSummary {
  if (
    !isRecord(data) ||
    !Array.isArray(data.items) ||
    !data.items.every(isMoverReceivedReviewDto) ||
    !isPagination(data.pagination) ||
    !isRecord(data.summary) ||
    !isNonNegativeInteger(data.summary.reviewCount) ||
    !(
      data.summary.averageRating === null ||
      isFiniteNumber(data.summary.averageRating)
    )
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "기사님 리뷰 응답 형식이 올바르지 않습니다.",
    );
  }

  return {
    reviews: data.items.map(mapMoverReceivedReview),
    ratingCounts:
      data.pagination.totalCount === data.items.length
        ? toRatingCountsFromReviews(data.items)
        : EMPTY_MOVER_REVIEW_RATING_COUNTS,
    totalCount: data.pagination.totalCount,
    totalPages: data.pagination.totalPages,
    averageRating: data.summary.averageRating ?? 0,
  };
}

/** 찜 목록 카드를 찾기 사이드바 카드 모델로 맞춥니다. region은 사이드바에서 쓰지 않습니다. */
export function mapFavoriteMoverToSearchResult(
  mover: FavoriteMover,
): MoverSearchResult {
  return {
    id: mover.id,
    serviceType: mover.serviceType,
    serviceTypes:
      mover.serviceTypes.length > 0 ? mover.serviceTypes : [mover.serviceType],
    region: "",
    moverName: mover.moverName,
    introduction: mover.introduction,
    description: mover.description,
    profileImageUrl: resolveApiAssetUrl(mover.profileImageUrl ?? null),
    rating: mover.rating,
    reviewCount: mover.reviewCount,
    careerYears: mover.careerYears,
    confirmedCount: mover.confirmedCount,
    favoriteCount: mover.favoriteCount,
  };
}
