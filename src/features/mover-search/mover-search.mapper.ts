import { ApiError } from "@/common/api/error";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

import {
  MOVER_SEARCH_PAGE_SIZE,
  REGION_SLUG_TO_API_VALUE,
} from "./mover-search.constants";
import type {
  MoverSearchItemDto,
  MoverSearchListDto,
  MoverSearchListParams,
  MoverSearchPageResult,
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
    region: item.region,
    moverName: item.moverName,
    introduction: item.introduction,
    description: item.description,
    profileImageUrl: item.profileImageUrl,
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
