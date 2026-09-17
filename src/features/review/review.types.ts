import type { Pagination } from "@/common/api/types";
import type { ServiceType } from "@/common/constants/domain";

export type CustomerReviewListType = "WRITABLE" | "WRITTEN";

/** 리뷰 응답에 포함되는 기사님 요약 DTO입니다. */
export interface ReviewMoverDto {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
}

/** 리뷰 응답에 포함되는 이사 요청 요약 DTO입니다. */
export interface ReviewMoveRequestDto {
  id: string;
  serviceType: string;
  moveDate: string;
  fromAddress: string;
  toAddress: string;
}

/** GET type=WRITABLE items — mover·moveRequest만 존재합니다. */
export interface WritableReviewDto {
  mover: ReviewMoverDto;
  moveRequest: ReviewMoveRequestDto;
}

/** GET type=WRITTEN / POST 응답의 review DTO입니다. */
export interface WrittenReviewDto {
  id: string;
  moveRequestId: string;
  moverId: string;
  rating: number;
  content: string;
  createdAt: string;
  mover: ReviewMoverDto;
  moveRequest: ReviewMoveRequestDto;
}

export interface CustomerReviewListParams {
  type: CustomerReviewListType;
  page?: number;
  pageSize?: number;
}

export interface CreateReviewRequest {
  moveRequestId: string;
  rating: number;
  content: string;
}

/**
 * 작성 가능 리뷰 카드 뷰 모델입니다.
 * id는 moveRequestId와 동일하며 POST /reviews에 사용합니다.
 * API에 없는 introduction·price·지정여부는 기본값으로 둡니다.
 */
export interface WritableReviewItem {
  id: string;
  moveRequestId: string;
  moverName: string;
  moverIntroduction: string;
  profileImageUrl?: string | null;
  serviceType: ServiceType;
  isDesignatedRequest?: boolean;
  departure: string;
  arrival: string;
  movedAt: string;
  price: number;
}

/**
 * 작성한 리뷰 카드 뷰 모델입니다.
 * API에 없는 introduction·지정여부는 기본값으로 둡니다.
 */
export interface WrittenReviewItem {
  id: string;
  moverName: string;
  moverIntroduction: string;
  profileImageUrl?: string | null;
  serviceType: ServiceType;
  isDesignatedRequest?: boolean;
  departure: string;
  arrival: string;
  movedAt: string;
  rating: number;
  content: string;
  /** 리뷰 작성일 — 카드 모바일에서만 표시 */
  writtenAt: string;
}

export interface WritableReviewListResult {
  type: "WRITABLE";
  items: WritableReviewItem[];
  pagination: Pagination;
}

export interface WrittenReviewListResult {
  type: "WRITTEN";
  items: WrittenReviewItem[];
  pagination: Pagination;
}
