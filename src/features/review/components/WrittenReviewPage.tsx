"use client";

import { useState } from "react";

import { ApiError } from "@/common/api/error";
import { Pagination } from "@/common/components/Pagination";
import { ROUTES } from "@/common/constants/routes";

import { useWrittenReviews } from "../hooks/useCustomerReviews";
import { EmptyReview } from "./EmptyReview";
import { ReviewTabs } from "./ReviewTabs";
import { WrittenReviewCard } from "./WrittenReviewCard";

/**
 * 내가 작성한 리뷰 페이지입니다.
 * GET type=WRITTEN 목록·pagination·empty(CTA → 작성 가능)만 담당합니다.
 */
export function WrittenReviewPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsQuery = useWrittenReviews(currentPage);

  const reviews = reviewsQuery.data?.items ?? [];
  const pagination = reviewsQuery.data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const totalCount = pagination?.totalCount ?? 0;
  const isEmpty =
    !reviewsQuery.isPending && !reviewsQuery.isError && totalCount === 0;

  const listErrorMessage =
    reviewsQuery.error instanceof ApiError
      ? reviewsQuery.error.message
      : "작성한 리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

  return (
    <>
      <ReviewTabs value="written" />

      <main className="min-h-[calc(100vh-108px)] bg-[#fafafa] min-[1200px]:min-h-[calc(100vh-168px)]">
        {reviewsQuery.isPending ? (
          <p
            role="status"
            className="py-20 text-center text-lg-regular text-[var(--input-placeholder)]"
          >
            작성한 리뷰를 불러오는 중입니다.
          </p>
        ) : reviewsQuery.isError ? (
          <section
            className="flex w-full flex-col items-center justify-center gap-4 px-6 py-20"
            role="alert"
          >
            <p className="text-lg-regular text-center text-[var(--input-placeholder)] min-[744px]:text-2xl-regular">
              {listErrorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                void reviewsQuery.refetch();
              }}
              className={[
                "flex h-[54px] items-center justify-center rounded-xl bg-[var(--primary-400)]! px-4",
                "text-lg-semibold text-[var(--gray-50)]!",
                "min-[744px]:h-16 min-[744px]:rounded-2xl min-[744px]:text-2lg-semibold",
                "transition-opacity hover:opacity-90",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
              ].join(" ")}
            >
              다시 시도
            </button>
          </section>
        ) : isEmpty ? (
          // Figma empty: CTA 노출 → 작성 가능 리뷰로 이동
          <section
            className={[
              "flex w-full flex-col items-center justify-center",
              "min-h-[calc(100vh-108px)] px-6 py-20",
              "min-[744px]:px-[72px]",
              "min-[1200px]:min-h-[calc(100vh-168px)] min-[1200px]:px-0 min-[1200px]:py-[180px]",
            ].join(" ")}
            aria-live="polite"
          >
            <EmptyReview
              message="아직 등록된 리뷰가 없어요!"
              actionLabel="리뷰 작성하러 가기"
              href={ROUTES.CUSTOMER.REVIEW.CREATE}
            />
          </section>
        ) : (
          <div
            className={[
              "mx-auto flex w-full max-w-[1120px] flex-col",
              "px-6 pt-6 pb-10",
              "min-[744px]:px-[72px] min-[744px]:pt-10 min-[744px]:pb-16",
              "min-[1200px]:px-0 min-[1200px]:pt-8",
            ].join(" ")}
          >
            <ul className="flex flex-col gap-5">
              {reviews.map((review) => (
                <li key={review.id}>
                  <WrittenReviewCard
                    moverName={review.moverName}
                    moverIntroduction={review.moverIntroduction}
                    profileImageUrl={review.profileImageUrl}
                    serviceType={review.serviceType}
                    isDesignatedRequest={review.isDesignatedRequest}
                    departure={review.departure}
                    arrival={review.arrival}
                    movedAt={review.movedAt}
                    rating={review.rating}
                    content={review.content}
                    writtenAt={review.writtenAt}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-10 flex justify-center min-[744px]:mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                size="lg"
                isLoading={reviewsQuery.isFetching}
                ariaLabel="내가 작성한 리뷰 페이지"
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
