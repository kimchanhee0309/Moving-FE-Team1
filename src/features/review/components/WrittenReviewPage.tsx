"use client";

import { useMemo, useState } from "react";

import { Pagination } from "@/common/components/Pagination";
import { ROUTES } from "@/common/constants/routes";

import {
  MOCK_WRITTEN_REVIEWS,
  WRITTEN_REVIEW_PAGE_SIZE,
  type WrittenReviewItem,
} from "../review.mock";
import { EmptyReview } from "./EmptyReview";
import { ReviewTabs } from "./ReviewTabs";
import { WrittenReviewCard } from "./WrittenReviewCard";

/**
 * 내가 작성한 리뷰 페이지입니다.
 * mock 목록·pagination·empty(CTA → 작성 가능)만 담당하고 API는 연동하지 않습니다.
 */
export function WrittenReviewPage() {
  const [reviews] = useState<WrittenReviewItem[]>(MOCK_WRITTEN_REVIEWS);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(reviews.length / WRITTEN_REVIEW_PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);

  const pageReviews = useMemo(() => {
    const start = (safePage - 1) * WRITTEN_REVIEW_PAGE_SIZE;
    return reviews.slice(start, start + WRITTEN_REVIEW_PAGE_SIZE);
  }, [reviews, safePage]);

  const isEmpty = reviews.length === 0;

  return (
    <>
      <ReviewTabs value="written" />

      <main className="min-h-[calc(100vh-108px)] bg-[#fafafa] min-[1200px]:min-h-[calc(100vh-168px)]">
        {isEmpty ? (
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
              {pageReviews.map((review) => (
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
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                size="lg"
                ariaLabel="내가 작성한 리뷰 페이지"
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
