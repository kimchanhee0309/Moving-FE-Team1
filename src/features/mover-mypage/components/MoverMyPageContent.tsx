"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { ErrorState, LoadingState } from "@/common/components/page-state";

import { getMoverMyPage, getMoverReviews, moverMyPageKeys } from "../mover-mypage.api";
import { MoverMyPageView } from "./MoverMyPageView";

const REVIEWS_PER_PAGE = 5;

export function MoverMyPageContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const myPageQuery = useQuery({
    queryKey: moverMyPageKeys.detail(),
    queryFn: ({ signal }) => getMoverMyPage(signal),
  });
  const reviewsQuery = useQuery({
    queryKey: moverMyPageKeys.reviews(currentPage, REVIEWS_PER_PAGE),
    queryFn: ({ signal }) => getMoverReviews(currentPage, REVIEWS_PER_PAGE, signal),
    placeholderData: keepPreviousData,
  });

  if (myPageQuery.isPending) return <LoadingState message="기사님 프로필을 불러오는 중이에요." />;
  if (myPageQuery.isError || !myPageQuery.data) {
    return (
      <ErrorState
        title="마이페이지를 불러오지 못했어요."
        description={getApiErrorMessage(myPageQuery.error, "잠시 후 다시 시도해 주세요.")}
        onRetry={() => { void myPageQuery.refetch(); }}
      />
    );
  }

  return (
    <MoverMyPageView
      data={myPageQuery.data}
      reviews={reviewsQuery.data}
      currentPage={currentPage}
      isReviewsLoading={reviewsQuery.isPending || reviewsQuery.isFetching}
      reviewError={reviewsQuery.error ? getApiErrorMessage(reviewsQuery.error, "리뷰를 불러오지 못했습니다.") : undefined}
      onPageChange={setCurrentPage}
      onRetryReviews={() => { void reviewsQuery.refetch(); }}
    />
  );
}
