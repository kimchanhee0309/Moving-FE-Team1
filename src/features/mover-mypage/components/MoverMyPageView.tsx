"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Pagination } from "@/common/components/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/common/components/page-state";
import { ReviewListCard } from "@/common/components/ReviewListCard";
import { ReviewProgressBar } from "@/common/components/ReviewProgressBar";
import { ROUTES } from "@/common/constants/routes";

import type { MoverMyPageData, MoverMyPageViewState } from "../mover-mypage.types";

interface MoverMyPageViewProps {
  data: MoverMyPageData;
  viewState?: MoverMyPageViewState;
}

const REVIEWS_PER_PAGE = 5;

/**
 * 기사님 마이페이지의 프로필 요약·평점 분포·페이지 단위 리뷰를 조합합니다.
 * 조회 DTO가 확정되면 mapper가 MoverMyPageData로 변환하며 이 컴포넌트는 API와 인증 훅을 직접 호출하지 않습니다.
 */
export function MoverMyPageView({ data, viewState = "ready" }: MoverMyPageViewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (viewState === "loading") {
    return <LoadingState message="기사님 프로필과 리뷰를 불러오는 중이에요." />;
  }

  if (viewState === "error") {
    return (
      <ErrorState
        title="마이페이지를 불러오지 못했어요."
        description="잠시 후 다시 시도해 주세요."
      />
    );
  }

  if (viewState === "empty") {
    return (
      <EmptyState
        title="등록된 기사님 프로필이 없어요."
        description="프로필을 등록하면 고객에게 서비스와 경력을 소개할 수 있어요."
        action={
          <Link
            href={ROUTES.MOVER.PROFILE.REGISTER}
            className="text-lg-semibold inline-flex min-h-[54px] items-center justify-center rounded-xl bg-[var(--primary-400)] px-6 text-[var(--gray-50)]"
          >
            프로필 등록하기
          </Link>
        }
      />
    );
  }

  const maxRatingCount = Math.max(...data.ratingCounts.map(({ count }) => count), 0);
  const totalPages = Math.max(Math.ceil(data.reviewCount / 20), 1);
  const currentReviews = data.reviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-[var(--gray-50)] pb-20">
      <div className="mx-auto w-full max-w-[1280px] px-5 pb-4 pt-4 min-[744px]:px-10 min-[744px]:pb-6 min-[744px]:pt-8">
        <h1 className="text-xl-bold text-[var(--black-500)] min-[1200px]:text-2xl-bold">마이페이지</h1>
      </div>

      <div className="relative h-[122px] overflow-hidden bg-[var(--primary-400)] min-[1200px]:h-[180px]" aria-hidden="true">
        <span className="absolute -left-3 top-5 -rotate-12 text-[76px] font-black italic leading-none text-white/15 min-[1200px]:left-[12%] min-[1200px]:top-8 min-[1200px]:text-[120px]">M</span>
        <span className="absolute -right-2 bottom-[-20px] -rotate-12 text-[100px] font-black italic leading-none text-white/15 min-[1200px]:right-[25%] min-[1200px]:text-[160px]">M</span>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-5 min-[744px]:px-10">
        <section className="grid gap-8 border-b border-[var(--line-100)] py-6 min-[1200px]:grid-cols-[minmax(0,820px)_minmax(240px,280px)] min-[1200px]:gap-x-[clamp(40px,5vw,100px)] min-[1200px]:py-10" aria-labelledby="mover-profile-heading">
          <div>
            <div className="flex items-start gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[var(--black-400)] min-[1200px]:h-[85px] min-[1200px]:w-20 min-[1200px]:rounded-2xl">
                <Image
                  src={data.profileImageUrl}
                  alt={`${data.nickname} 기사님 프로필`}
                  fill
                  sizes="(min-width: 1200px) 80px, 64px"
                  priority
                  className="scale-125 object-cover"
                />
              </div>
              <div className="min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[var(--primary-400)] text-xs font-bold text-white" aria-hidden="true">M</span>
                  <h2 id="mover-profile-heading" className="text-xl-bold text-[var(--black-400)]">{data.nickname}</h2>
                </div>
                <p className="text-md-medium mt-1 text-[var(--black-300)]" aria-label={`찜 ${data.favoriteCount}개`}>♥ {data.favoriteCount}</p>
              </div>
            </div>
            <p className="text-lg-semibold mt-4 text-[var(--black-300)] min-[1200px]:mt-3">{data.shortIntroduction}</p>
            <p className="text-md-regular mt-3 max-w-[820px] whitespace-pre-line text-[var(--gray-500)]">{data.description}</p>
          </div>

          <div className="flex flex-col gap-2 min-[1200px]:pt-[72px]">
            <Link href={ROUTES.MOVER.PROFILE.EDIT} className="text-2lg-semibold inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-[var(--primary-400)] px-4 text-white transition-colors hover:bg-[#e04829] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl">
              내 프로필 수정 <span aria-hidden="true">✎</span>
            </Link>
            <Link href={ROUTES.MOVER.BASIC_INFO_EDIT} className="text-2lg-semibold inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-[#c4c4c4] px-4 text-[var(--gray-400)] transition-colors hover:bg-[var(--gray-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl">
              기본 정보 수정 <span aria-hidden="true">✎</span>
            </Link>
          </div>

          <div className="min-[1200px]:col-span-1">
            <h3 className="text-lg-semibold mb-3 text-[var(--black-300)]">활동 현황</h3>
            <dl className="grid grid-cols-3 rounded-2xl border border-[var(--line-100)] bg-[var(--background-100)] px-2 py-5 text-center shadow-[2px_2px_8px_rgb(224_224_224_/_20%)] min-[1200px]:py-8">
              <div><dt className="text-md-medium text-[var(--black-300)]">진행</dt><dd className="text-xl-bold mt-1 text-[var(--primary-400)]">{data.confirmedCount}건</dd></div>
              <div><dt className="text-md-medium text-[var(--black-300)]">리뷰</dt><dd className="text-xl-bold mt-1 text-[var(--primary-400)]">{data.rating.toFixed(1)}</dd></div>
              <div><dt className="text-md-medium text-[var(--black-300)]">총 경력</dt><dd className="text-xl-bold mt-1 text-[var(--primary-400)]">{data.careerYears}년</dd></div>
            </dl>

            <div className="mt-6 flex flex-col gap-6 min-[1200px]:mt-10">
              <ProfileTagList title="제공 서비스" labels={data.serviceLabels} isSelected />
              <ProfileTagList title="서비스 가능 지역" labels={data.regionLabels} />
            </div>
          </div>
        </section>

        <section className="py-6 min-[1200px]:py-10" aria-labelledby="rating-heading">
          <h2 id="rating-heading" className="text-lg-semibold mb-4 text-[var(--black-300)] min-[1200px]:text-xl-bold">리뷰</h2>
          <div className="grid gap-6 min-[1200px]:grid-cols-[360px_284px] min-[1200px]:gap-x-[98px]">
            <div className="flex items-center gap-4">
              <strong className="text-[40px] font-medium leading-[52px] text-[var(--black-400)]">{data.rating.toFixed(1)}</strong>
              <div>
                <p className="tracking-wider text-[var(--secondary-yellow-100)]" aria-hidden="true">★★★★★</p>
                <p className="text-md-regular text-[var(--gray-400)]">{data.reviewCount}개의 리뷰</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {data.ratingCounts.map(({ score, count }) => (
                <ReviewProgressBar key={score} score={score} count={count} maxCount={maxRatingCount} />
              ))}
            </div>
          </div>

          {currentReviews.length > 0 ? (
            <>
              <div className="mt-6 min-[1200px]:mt-8">
                {currentReviews.map((review) => (
                  <ReviewListCard key={review.id} {...review} size="lg" className="max-w-full" />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} size="sm" className="mt-8 justify-center" ariaLabel="받은 리뷰 페이지 이동" onPageChange={setCurrentPage} />
            </>
          ) : (
            <EmptyState title="아직 받은 리뷰가 없어요." description="이사를 완료하면 고객의 리뷰가 여기에 표시됩니다." />
          )}
        </section>
      </div>
    </main>
  );
}

interface ProfileTagListProps {
  title: string;
  labels: string[];
  isSelected?: boolean;
}

function ProfileTagList({ title, labels, isSelected = false }: ProfileTagListProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg-semibold text-[var(--black-300)]">{title}</h3>
      <ul className="flex list-none flex-wrap gap-2 p-0">
        {labels.map((label) => (
          <li key={label} className={`text-md-medium rounded-full border px-3 py-1.5 ${isSelected ? "border-[var(--primary-400)] bg-[var(--primary-100)] text-[var(--primary-400)]" : "border-[var(--gray-300)] bg-[var(--background-100)] text-[var(--black-400)]"}`}>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
