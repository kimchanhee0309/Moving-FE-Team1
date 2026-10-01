"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { ErrorState, LoadingState } from "@/common/components/page-state";

import { getMoverMyPage, getMoverReviews, moverMyPageKeys } from "../mover-mypage.api";
import { MoverMyPageView } from "./MoverMyPageView";

const REVIEWS_PER_PAGE = 5;

export function MoverMyPageContent() {
  const t = useTranslations("Profile");
  const common = useTranslations("Common");
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

  if (myPageQuery.isPending) return <LoadingState message={t("moverLoading")} />;
  if (myPageQuery.isError || !myPageQuery.data) {
    return (
      <ErrorState
        title={t("myPageLoadError")}
        description={getApiErrorMessage(myPageQuery.error, common("errorDescription"))}
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
      reviewError={reviewsQuery.error ? getApiErrorMessage(reviewsQuery.error, t("reviewLoadFailed")) : undefined}
      onPageChange={setCurrentPage}
      onRetryReviews={() => { void reviewsQuery.refetch(); }}
    />
  );
}
