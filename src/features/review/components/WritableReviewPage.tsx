"use client";

import { useMemo, useState } from "react";

import { Pagination } from "@/common/components/Pagination";

import {
  MOCK_WRITABLE_REVIEWS,
  WRITABLE_REVIEW_PAGE_SIZE,
  type WritableReviewItem,
} from "../review.mock";
import { EmptyReview } from "./EmptyReview";
import { ReviewableCard } from "./ReviewableCard";
import { ReviewTabs } from "./ReviewTabs";
import { ReviewWriteModal } from "./ReviewWriteModal";

interface ModalDraft {
  review: WritableReviewItem;
  rating: number;
  content: string;
}

export function WritableReviewPage() {
  const [reviews, setReviews] = useState<WritableReviewItem[]>(
    MOCK_WRITABLE_REVIEWS,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [draft, setDraft] = useState<ModalDraft | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPages = Math.max(
    1,
    Math.ceil(reviews.length / WRITABLE_REVIEW_PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);

  const pageReviews = useMemo(() => {
    const start = (safePage - 1) * WRITABLE_REVIEW_PAGE_SIZE;
    return reviews.slice(start, start + WRITABLE_REVIEW_PAGE_SIZE);
  }, [reviews, safePage]);

  const handleOpenWrite = (review: WritableReviewItem) => {
    setDraft({ review, rating: 0, content: "" });
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setDraft(null);
  };

  const handleSubmit = () => {
    if (!draft) return;
    setIsSubmitting(true);

    const submittedId = draft.review.id;
    const nextReviews = reviews.filter((item) => item.id !== submittedId);
    const nextTotalPages = Math.max(
      1,
      Math.ceil(nextReviews.length / WRITABLE_REVIEW_PAGE_SIZE),
    );

    setReviews(nextReviews);
    setCurrentPage((page) => Math.min(page, nextTotalPages));
    setDraft(null);
    setIsSubmitting(false);
  };

  const isEmpty = reviews.length === 0;

  return (
    <>
      <ReviewTabs value="writable" />

      <main className="min-h-[calc(100vh-108px)] bg-[#fafafa] min-[1200px]:min-h-[calc(100vh-168px)]">
        {isEmpty ? (
          // min-h만 있는 flex 부모의 flex-1은 높이가 확정되지 않아 중앙 정렬이 깨짐.
          // empty 섹션에 같은 뷰포트 높이를 직접 주고 가로·세로 중앙에 둡니다.
          <section
            className={[
              "flex w-full flex-col items-center justify-center",
              "min-h-[calc(100vh-108px)] px-6 py-20",
              "min-[744px]:px-[72px]",
              "min-[1200px]:min-h-[calc(100vh-168px)] min-[1200px]:px-0 min-[1200px]:py-[180px]",
            ].join(" ")}
            aria-live="polite"
          >
            <EmptyReview message="작성 가능한 리뷰가 없어요!" />
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
                  <ReviewableCard
                    moverName={review.moverName}
                    moverIntroduction={review.moverIntroduction}
                    profileImageUrl={review.profileImageUrl}
                    serviceType={review.serviceType}
                    isDesignatedRequest={review.isDesignatedRequest}
                    departure={review.departure}
                    arrival={review.arrival}
                    movedAt={review.movedAt}
                    price={review.price}
                    onWriteReview={() => handleOpenWrite(review)}
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
                ariaLabel="작성 가능한 리뷰 페이지"
              />
            </div>
          </div>
        )}
      </main>

      {draft ? (
        <ReviewWriteModal
          isOpen
          onClose={handleCloseModal}
          moverName={draft.review.moverName}
          profileImageUrl={draft.review.profileImageUrl}
          serviceType={draft.review.serviceType}
          isDesignatedRequest={draft.review.isDesignatedRequest}
          departure={draft.review.departure}
          arrival={draft.review.arrival}
          movedAt={draft.review.movedAt}
          rating={draft.rating}
          content={draft.content}
          onRatingChange={(rating) =>
            setDraft((prev) => (prev ? { ...prev, rating } : prev))
          }
          onContentChange={(content) =>
            setDraft((prev) => (prev ? { ...prev, content } : prev))
          }
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </>
  );
}
