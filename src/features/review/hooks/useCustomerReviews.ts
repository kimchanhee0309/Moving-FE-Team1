"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createReview,
  fetchWritableReviews,
  fetchWrittenReviews,
} from "../review.api";
import {
  WRITABLE_REVIEW_PAGE_SIZE,
  WRITTEN_REVIEW_PAGE_SIZE,
} from "../review.constants";
import { reviewKeys } from "../review.keys";
import type { CreateReviewRequest } from "../review.types";

/**
 * 작성 가능 리뷰 목록 Query입니다.
 * 서버 page/pageSize를 사용하며 클라이언트 슬라이스하지 않습니다.
 */
export function useWritableReviews(page: number) {
  const params = {
    type: "WRITABLE" as const,
    page,
    pageSize: WRITABLE_REVIEW_PAGE_SIZE,
  };

  return useQuery({
    queryKey: reviewKeys.customerList(params),
    queryFn: ({ signal }) =>
      fetchWritableReviews(
        { page: params.page, pageSize: params.pageSize },
        signal,
      ),
  });
}

/**
 * 작성한 리뷰 목록 Query입니다.
 * 서버 page/pageSize를 사용하며 클라이언트 슬라이스하지 않습니다.
 */
export function useWrittenReviews(page: number) {
  const params = {
    type: "WRITTEN" as const,
    page,
    pageSize: WRITTEN_REVIEW_PAGE_SIZE,
  };

  return useQuery({
    queryKey: reviewKeys.customerList(params),
    queryFn: ({ signal }) =>
      fetchWrittenReviews(
        { page: params.page, pageSize: params.pageSize },
        signal,
      ),
  });
}

/**
 * 리뷰 작성 Mutation입니다.
 * 성공 시 작성 가능·작성한 리뷰 목록 캐시를 함께 무효화합니다.
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewRequest) => createReview(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: reviewKeys.customerLists(),
      });
    },
  });
}
