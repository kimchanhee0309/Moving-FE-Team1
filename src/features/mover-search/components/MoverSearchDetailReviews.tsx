"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

import { Pagination } from "@/common/components/Pagination";
import { ReviewListCard } from "@/common/components/ReviewListCard";
import { ReviewProgressBar } from "@/common/components/ReviewProgressBar";

import type { MoverReview, MoverReviewRatingCount } from "../mover-search.types";

interface MoverSearchDetailReviewsProps {
  rating: number;
  reviewCount: number;
  ratingCounts: MoverReviewRatingCount[];
  reviews: MoverReview[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const STAR_NUMBERS = [1, 2, 3, 4, 5] as const;

export function MoverSearchDetailReviews({
  rating,
  reviewCount,
  ratingCounts,
  reviews,
  totalCount,
  totalPages,
  currentPage,
  onPageChange,
  isLoading,
}: MoverSearchDetailReviewsProps) {
  const t = useTranslations("MoverDetail");
  const maxCount = Math.max(...ratingCounts.map((item) => item.count), 0);
  const filledStars = Math.min(Math.max(Math.round(rating), 0), 5);

  return (
    <section className="flex w-full flex-col gap-4" aria-labelledby="mover-review-heading">
      <h2
        id="mover-review-heading"
        className="text-lg-semibold text-[var(--content-strong)] min-[744px]:text-xl-semibold"
      >
        {t("reviews")}
      </h2>

      {totalCount === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="text-lg-semibold leading-7 text-[var(--black-500)]">
            {t("noReviews")}
          </p>
          <p className="text-md-regular leading-7 text-[var(--input-placeholder)]">
            {t("firstReview")}
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6 min-[744px]:flex-row min-[744px]:items-start min-[744px]:justify-between">
            <div className="flex items-end gap-[18px]">
              <p className="text-[40px] leading-none font-medium text-[var(--content-strong)]">
                {rating.toFixed(1)}
              </p>
              <div className="flex flex-col">
                <div
                  className="flex"
                  aria-label={t("ratingLabel", { rating: rating.toFixed(1) })}
                >
                  {STAR_NUMBERS.map((starNumber) => (
                    <Image
                      key={starNumber}
                      src="/icons/ic-star.svg"
                      alt=""
                      width={20}
                      height={20}
                      className={`size-5 ${starNumber > filledStars ? "opacity-25 grayscale" : ""}`}
                    />
                  ))}
                </div>
                <p className="text-md-regular text-[var(--content-muted)]">
                  {t("reviewCount", { count: reviewCount })}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {ratingCounts.map((item) => (
                <ReviewProgressBar
                  key={item.score}
                  score={item.score}
                  count={item.count}
                  maxCount={maxCount}
                  isLoading={isLoading}
                />
              ))}
            </div>
          </div>

          <div className="mt-2">
            {reviews.map((review) => (
              <ReviewListCard
                key={review.id}
                reviewerName={review.reviewerName}
                writtenAt={review.writtenAt}
                rating={review.rating}
                content={review.content}
                size="lg"
                className="max-w-full"
              />
            ))}
          </div>

          {totalPages > 1 ? (
            <>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                size="sm"
                className="mt-2 justify-center min-[1200px]:hidden"
                ariaLabel={t("reviewPagination")}
                onPageChange={onPageChange}
                isLoading={isLoading}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                size="lg"
                className="mt-2 hidden justify-center min-[1200px]:flex"
                ariaLabel={t("reviewPagination")}
                onPageChange={onPageChange}
                isLoading={isLoading}
              />
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
