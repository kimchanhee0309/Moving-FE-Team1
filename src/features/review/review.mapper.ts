import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { ApiError } from "@/common/api/error";
import type { Pagination } from "@/common/api/types";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

import type {
  CreateReviewRequest,
  ReviewMoveRequestDto,
  ReviewMoverDto,
  WritableReviewDto,
  WritableReviewItem,
  WritableReviewListResult,
  WrittenReviewDto,
  WrittenReviewItem,
  WrittenReviewListResult,
} from "./review.types";
import { toDisplayRegionAddress } from "./review.utils";

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
      "리뷰 목록 페이지 정보가 올바르지 않습니다.",
    );
  }

  return {
    page: value.page,
    pageSize: value.pageSize,
    totalCount: value.totalCount,
    totalPages: value.totalPages,
  };
}

function readMover(value: unknown): ReviewMoverDto {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.nickname !== "string" ||
    !(
      value.profileImageUrl === null ||
      typeof value.profileImageUrl === "string"
    )
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "리뷰 기사님 정보가 올바르지 않습니다.",
    );
  }

  return {
    id: value.id,
    nickname: value.nickname,
    profileImageUrl: value.profileImageUrl,
  };
}

function readMoveRequest(value: unknown): ReviewMoveRequestDto {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.serviceType !== "string" ||
    typeof value.moveDate !== "string" ||
    typeof value.fromAddress !== "string" ||
    typeof value.toAddress !== "string"
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "리뷰 이사 요청 정보가 올바르지 않습니다.",
    );
  }

  return {
    id: value.id,
    serviceType: value.serviceType,
    moveDate: value.moveDate,
    fromAddress: value.fromAddress,
    toAddress: value.toAddress,
  };
}

function readWritableItem(value: unknown): WritableReviewDto {
  if (!isRecord(value)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "작성 가능 리뷰 항목이 올바르지 않습니다.",
    );
  }

  return {
    mover: readMover(value.mover),
    moveRequest: readMoveRequest(value.moveRequest),
  };
}

function readWrittenItem(value: unknown): WrittenReviewDto {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.moveRequestId !== "string" ||
    typeof value.moverId !== "string" ||
    typeof value.rating !== "number" ||
    !Number.isInteger(value.rating) ||
    value.rating < 1 ||
    value.rating > 5 ||
    typeof value.content !== "string" ||
    typeof value.createdAt !== "string"
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "작성한 리뷰 항목이 올바르지 않습니다.",
    );
  }

  return {
    id: value.id,
    moveRequestId: value.moveRequestId,
    moverId: value.moverId,
    rating: value.rating,
    content: value.content,
    createdAt: value.createdAt,
    mover: readMover(value.mover),
    moveRequest: readMoveRequest(value.moveRequest),
  };
}

function toServiceType(value: string): ServiceType {
  if (!isServiceType(value)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "지원하지 않는 이사 서비스 유형입니다.",
    );
  }

  return value;
}

export function mapWritableReviewToItem(
  item: WritableReviewDto,
): WritableReviewItem {
  return {
    id: item.moveRequest.id,
    moveRequestId: item.moveRequest.id,
    moverName: item.mover.nickname,
    // API에 한줄/상세 소개가 없어 빈 문자열로 둡니다.
    moverIntroduction: "",
    // BE는 상대 경로(`/uploads/...`)를 줄 수 있어 API origin으로 변환합니다.
    profileImageUrl: resolveApiAssetUrl(item.mover.profileImageUrl),
    serviceType: toServiceType(item.moveRequest.serviceType),
    departure: toDisplayRegionAddress(item.moveRequest.fromAddress),
    arrival: toDisplayRegionAddress(item.moveRequest.toAddress),
    movedAt: item.moveRequest.moveDate,
    // Favorite/Review 카드 공용 props용. 견적 금액은 Review API에 없습니다.
    price: 0,
  };
}

export function mapWrittenReviewToItem(
  item: WrittenReviewDto,
): WrittenReviewItem {
  return {
    id: item.id,
    moverName: item.mover.nickname,
    moverIntroduction: "",
    // BE는 상대 경로(`/uploads/...`)를 줄 수 있어 API origin으로 변환합니다.
    profileImageUrl: resolveApiAssetUrl(item.mover.profileImageUrl),
    serviceType: toServiceType(item.moveRequest.serviceType),
    departure: toDisplayRegionAddress(item.moveRequest.fromAddress),
    arrival: toDisplayRegionAddress(item.moveRequest.toAddress),
    movedAt: item.moveRequest.moveDate,
    rating: item.rating,
    content: item.content,
    writtenAt: item.createdAt,
  };
}

/** apiClient가 벗긴 GET /customers/me/reviews?type=WRITABLE data를 검증·변환합니다. */
export function readWritableReviewList(
  data: unknown,
): WritableReviewListResult {
  if (
    !isRecord(data) ||
    data.type !== "WRITABLE" ||
    !Array.isArray(data.items)
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "작성 가능 리뷰 목록 응답이 올바르지 않습니다.",
    );
  }

  return {
    type: "WRITABLE",
    items: data.items.map((item) =>
      mapWritableReviewToItem(readWritableItem(item)),
    ),
    pagination: readPagination(data.pagination),
  };
}

/** apiClient가 벗긴 GET /customers/me/reviews?type=WRITTEN data를 검증·변환합니다. */
export function readWrittenReviewList(data: unknown): WrittenReviewListResult {
  if (
    !isRecord(data) ||
    data.type !== "WRITTEN" ||
    !Array.isArray(data.items)
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "작성한 리뷰 목록 응답이 올바르지 않습니다.",
    );
  }

  return {
    type: "WRITTEN",
    items: data.items.map((item) =>
      mapWrittenReviewToItem(readWrittenItem(item)),
    ),
    pagination: readPagination(data.pagination),
  };
}

/** apiClient가 벗긴 POST /reviews data.review를 검증합니다. */
export function readCreatedReview(data: unknown): WrittenReviewDto {
  if (!isRecord(data) || !("review" in data)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "리뷰 작성 응답이 올바르지 않습니다.",
    );
  }

  return readWrittenItem(data.review);
}

export function assertCreateReviewRequest(
  payload: CreateReviewRequest,
): CreateReviewRequest {
  const moveRequestId = payload.moveRequestId.trim();
  const content = payload.content.trim();
  const rating = payload.rating;

  if (!moveRequestId) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "리뷰를 작성할 이사 요청이 없습니다.",
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "별점은 1부터 5까지의 정수여야 합니다.",
    );
  }

  if (content.length < 10 || content.length > 500) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "리뷰 내용은 10자 이상 500자 이하로 작성해 주세요.",
    );
  }

  return { moveRequestId, rating, content };
}
