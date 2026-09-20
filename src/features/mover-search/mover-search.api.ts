import { apiClient } from "@/common/api/client";
import { ApiError } from "@/common/api/error";

import { MOVER_DETAIL_REVIEW_PAGE_SIZE } from "./mover-search.constants";
import {
  mapMoverReviewPageResult,
  mapMoverSearchDetailResult,
  mapMoverSearchListResult,
  mapMoverSearchRecommendedResult,
  toMoverSearchListQuery,
} from "./mover-search.mapper";
import type {
  MoverDetail,
  MoverReviewSummary,
  MoverSearchListParams,
  MoverSearchPageResult,
  MoverSearchResult,
} from "./mover-search.types";

/**
 * 기사님 찾기 REST 호출입니다. `credentials: "include"`와 오류 변환은 공통
 * `apiClient`가 담당합니다. 찜 POST/DELETE와 지정 요청 POST는 각 담당 API를 재사용합니다.
 */

/** `GET /movers` — 검색·지역·서비스·정렬이 적용된 기사님 목록 한 페이지를 조회합니다. */
export async function fetchMoverSearchPage(
  params: MoverSearchListParams,
  page: number,
  signal?: AbortSignal,
): Promise<MoverSearchPageResult> {
  const data = await apiClient<unknown>("/movers", {
    query: toMoverSearchListQuery(params, page),
    signal,
  });

  return mapMoverSearchListResult(data);
}

/** `GET /movers/recommended` — 사이드바용 추천 기사님을 조회합니다. */
export async function fetchRecommendedMovers(
  signal?: AbortSignal,
): Promise<MoverSearchResult[]> {
  const data = await apiClient<unknown>("/movers/recommended", { signal });
  return mapMoverSearchRecommendedResult(data);
}

/**
 * `GET /movers/:id` — 기사님 상세를 조회합니다. 없으면 `null`입니다.
 */
export async function fetchMoverDetail(
  moverId: string,
  signal?: AbortSignal,
): Promise<MoverDetail | null> {
  try {
    const data = await apiClient<unknown>(`/movers/${moverId}`, { signal });
    return mapMoverSearchDetailResult(data);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

/** `GET /movers/:moverId/reviews` — 기사님이 받은 리뷰 한 페이지를 공개 조회합니다. */
export async function fetchMoverReviews(
  moverId: string,
  page: number,
  signal?: AbortSignal,
): Promise<MoverReviewSummary> {
  const data = await apiClient<unknown>(`/movers/${moverId}/reviews`, {
    query: { page, pageSize: MOVER_DETAIL_REVIEW_PAGE_SIZE },
    signal,
  });

  return mapMoverReviewPageResult(data);
}
