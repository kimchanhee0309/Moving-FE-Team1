"use client";

import { useState } from "react";

import { ApiError } from "@/common/api/error";
import { Pagination } from "@/common/components/Pagination";

import {
  useCreateReview,
  useWritableReviews,
} from "../hooks/useCustomerReviews";
import type { WritableReviewItem } from "../review.types";
import { EmptyReview } from "./EmptyReview";
import { ReviewableCard } from "./ReviewableCard";
import { ReviewTabs } from "./ReviewTabs";
import { ReviewWriteModal } from "./ReviewWriteModal";

interface ModalDraft {
  review: WritableReviewItem;
  rating: number;
  content: string;
}

/**
 * 작성 가능한 리뷰 페이지입니다.
 * GET type=WRITABLE 목록·POST /reviews 작성·pagination·empty만 담당합니다.
 */
export function WritableReviewPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [draft, setDraft] = useState<ModalDraft | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reviewsQuery = useWritableReviews(currentPage);
  const createMutation = useCreateReview();

  const reviews = reviewsQuery.data?.items ?? [];
  const pagination = reviewsQuery.data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const totalCount = pagination?.totalCount ?? 0;
  const isEmpty =
    !reviewsQuery.isPending && !reviewsQuery.isError && totalCount === 0;
  const isSubmitting = createMutation.isPending;

  const handleOpenWrite = (review: WritableReviewItem) => {
    setSubmitError(null);
    setDraft({ review, rating: 0, content: "" });
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setSubmitError(null);
    setDraft(null);
  };

  const handleSubmit = () => {
    if (!draft || isSubmitting) return;

    setSubmitError(null);
    createMutation.mutate(
      {
        moveRequestId: draft.review.moveRequestId,
        rating: draft.rating,
        content: draft.content,
      },
      {
        onSuccess: () => {
          setDraft(null);
          // 현재 페이지 마지막 1건을 작성하면 이전 페이지로 맞춥니다.
          if (reviews.length === 1 && currentPage > 1) {
            setCurrentPage((page) => page - 1);
          }
        },
        onError: (error) => {
          const message =
            error instanceof ApiError
              ? error.message
              : "리뷰 작성에 실패했습니다. 다시 시도해 주세요.";
          setSubmitError(message);
        },
      },
    );
  };

  const listErrorMessage =
    reviewsQuery.error instanceof ApiError
      ? reviewsQuery.error.message
      : "작성 가능한 리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

  return (
    <>
      <ReviewTabs value="writable" />

      <main className="min-h-[calc(100vh-108px)] bg-[#fafafa] min-[1200px]:min-h-[calc(100vh-168px)]">
        {reviewsQuery.isPending ? (
          <p
            role="status"
            className="py-20 text-center text-lg-regular text-[var(--input-placeholder)]"
          >
            작성 가능한 리뷰를 불러오는 중입니다.
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
              {reviews.map((review) => (
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
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                size="lg"
                isLoading={reviewsQuery.isFetching}
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
          onRatingChange={(rating) => {
            setSubmitError(null);
            setDraft((prev) => (prev ? { ...prev, rating } : prev));
          }}
          onContentChange={(content) => {
            setSubmitError(null);
            setDraft((prev) => (prev ? { ...prev, content } : prev));
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : null}

      {submitError ? (
        <p
          role="alert"
          className="fixed bottom-6 left-1/2 z-50 max-w-[min(90vw,420px)] -translate-x-1/2 rounded-xl bg-[var(--black-400)] px-4 py-3 text-center text-md-regular text-[var(--gray-50)]"
        >
          {submitError}
        </p>
      ) : null}
    </>
  );
}
