"use client";

import { useState } from "react";

import { Pagination } from "@/common/components/Pagination";
import { ReviewListCard } from "@/common/components/ReviewListCard";
import { ReviewProgressBar } from "@/common/components/ReviewProgressBar";
import type { ReviewScore } from "@/common/components/ReviewProgressBar";

const REVIEW_DISTRIBUTION: ReadonlyArray<{ score: ReviewScore; count: number }> = [
  { score: 5, count: 170 },
  { score: 4, count: 8 },
  { score: 3, count: 5 },
  { score: 2, count: 3 },
  { score: 1, count: 1 },
];

/** 서버 데이터 없이 리뷰 영역의 controlled pagination과 loading 시각 상태만 검수합니다. */
export function MoverMypageComponentExamples() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-6" aria-labelledby="review-chart-title">
        <div>
          <h2 id="review-chart-title" className="text-xl-bold text-[var(--black-400)]">
            Progress-bar-review
          </h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            가장 많은 별점 개수를 기준으로 180×8px 진행 바의 비율을 계산합니다.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {REVIEW_DISTRIBUTION.map(({ score, count }) => (
            <ReviewProgressBar
              key={score}
              score={score}
              count={count}
              maxCount={REVIEW_DISTRIBUTION[0].count}
            />
          ))}
          <ReviewProgressBar score={5} count={0} maxCount={0} isLoading />
        </div>
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="review-card-title">
        <div>
          <h2 id="review-card-title" className="text-xl-bold text-[var(--black-400)]">
            Card-list-review
          </h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            모바일·태블릿용 600px 변형과 데스크톱용 955px 변형을 비교합니다.
          </p>
        </div>
        <ReviewListCard
          reviewerName="kim****"
          writtenAt="2024-07-01"
          rating={5}
          content={"듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요!\n비 오는데 꼼꼼히 잘 해주셔서 감사드립니다 :)"}
        />
        <ReviewListCard
          size="lg"
          reviewerName="moving***"
          writtenAt="2024-06-28"
          rating={4}
          content="나중에 또 짐 옮길 일이 있으면 기사님께 부탁드릴 예정입니다!"
        />
        <ReviewListCard
          size="sm"
          reviewerName=""
          writtenAt=""
          rating={0}
          content=""
          isLoading
        />
      </section>

      <section className="flex flex-col gap-6" aria-labelledby="pagination-title">
        <div>
          <h2 id="pagination-title" className="text-xl-bold text-[var(--black-400)]">
            Pagination
          </h2>
          <p className="text-md-regular mt-1 text-[var(--gray-500)]">
            현재 페이지 {currentPage} · 총 9페이지
          </p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={9}
          onPageChange={setCurrentPage}
        />
        <Pagination
          size="lg"
          currentPage={currentPage}
          totalPages={9}
          onPageChange={setCurrentPage}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={9}
          onPageChange={setCurrentPage}
          isLoading
          ariaLabel="로딩 중인 페이지네이션 예시"
        />
      </section>
    </div>
  );
}
