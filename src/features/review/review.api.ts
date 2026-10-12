import { apiClient } from "@/common/api/client";

import {
  WRITABLE_REVIEW_PAGE_SIZE,
  WRITTEN_REVIEW_PAGE_SIZE,
} from "./review.constants";
import {
  assertCreateReviewRequest,
  mapWrittenReviewToItem,
  readCreatedReview,
  readWritableReviewList,
  readWrittenReviewList,
} from "./review.mapper";
import type {
  CreateReviewRequest,
  WritableReviewListResult,
  WrittenReviewItem,
  WrittenReviewListResult,
} from "./review.types";

/**
 * GET /customers/me/reviews?type=WRITABLE
 * 완료됐지만 리뷰가 없는 이사 요청 목록을 최신 이사일순으로 조회합니다.
 */
export async function fetchWritableReviews(
  params: { page?: number; pageSize?: number } = {},
  signal?: AbortSignal,
): Promise<WritableReviewListResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? WRITABLE_REVIEW_PAGE_SIZE;
  const data = await apiClient<unknown>("/customers/me/reviews", {
    query: { type: "WRITABLE", page, pageSize },
    signal,
    cache: "no-store",
  });

  return readWritableReviewList(data);
}

/**
 * GET /customers/me/reviews?type=WRITTEN
 * 로그인한 CUSTOMER가 작성한 리뷰 목록을 최신 작성순으로 조회합니다.
 */
export async function fetchWrittenReviews(
  params: { page?: number; pageSize?: number } = {},
  signal?: AbortSignal,
): Promise<WrittenReviewListResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? WRITTEN_REVIEW_PAGE_SIZE;
  const data = await apiClient<unknown>("/customers/me/reviews", {
    query: { type: "WRITTEN", page, pageSize },
    signal,
    cache: "no-store",
  });

  return readWrittenReviewList(data);
}

/**
 * POST /reviews — 완료·확정된 본인 이사에 리뷰를 작성합니다.
 * moveRequestId당 한 건만 허용됩니다.
 */
export async function createReview(
  payload: CreateReviewRequest,
): Promise<WrittenReviewItem> {
  const body = assertCreateReviewRequest(payload);
  const data = await apiClient<unknown>("/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return mapWrittenReviewToItem(readCreatedReview(data));
}
