"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import { Pagination } from "@/common/components/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/common/components/page-state";
import { ReviewListCard } from "@/common/components/ReviewListCard";
import { OriginalTextNotice } from "@/common/components/OriginalTextNotice";
import { ReviewProgressBar } from "@/common/components/ReviewProgressBar";
import { ROUTES } from "@/common/constants/routes";

import type { MoverMyPageData, MoverReviewPage } from "../mover-mypage.types";

interface MoverMyPageViewProps {
  data: MoverMyPageData;
  reviews?: MoverReviewPage;
  currentPage: number;
  isReviewsLoading?: boolean;
  reviewError?: string;
  onPageChange: (page: number) => void;
  onRetryReviews: () => void;
}

/**
 * 기사님 마이페이지의 프로필 요약·평점 분포·페이지 단위 리뷰를 조합합니다.
 * 조회 DTO가 확정되면 mapper가 MoverMyPageData로 변환하며 이 컴포넌트는 API와 인증 훅을 직접 호출하지 않습니다.
 */
export function MoverMyPageView({
  data,
  reviews,
  currentPage,
  isReviewsLoading = false,
  reviewError,
  onPageChange,
  onRetryReviews,
}: MoverMyPageViewProps) {
  const t = useTranslations("Profile");
  const maxRatingCount = Math.max(...data.ratingCounts.map(({ count }) => count), 0);
  const totalPages = reviews?.pagination.totalPages ?? 0;
  const currentReviews = reviews?.items ?? [];
  const displayedRating = reviews?.summary.averageRating ?? data.rating;
  const displayedReviewCount = reviews?.summary.reviewCount ?? data.reviewCount;

  return (
    <main className="min-h-screen bg-[var(--gray-50)] pb-20">
      {/*
        컨테이너 폭·padding은 GNB(`Gnb.tsx`)의 `max-w-[1920px]` 기준과 맞춘다 — 예전엔
        `max-w-[1280px]`에 1200px 이상 전용 padding이 아예 없어(744px 단계 `px-10`이 그대로
        이어짐) 1200px 이상 화면에서 GNB 로고와 이 제목의 중앙정렬 기준 폭이 달라 화면이
        커질수록 간격이 계속 벌어졌다. 744px 미만/744~1199px 구간의 기존 padding은 그대로 둔다.
      */}
      <div className="mx-auto w-full max-w-[1920px] px-5 pb-4 pt-4 min-[744px]:px-10 min-[744px]:pb-6 min-[744px]:pt-8 min-[1200px]:px-40">
        <h1 className="text-xl-bold text-[var(--black-500)] min-[1200px]:text-2xl-bold">{t("myPage")}</h1>
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
                  alt={t("moverProfileAlt", { name: data.nickname })}
                  fill
                  sizes="(min-width: 1200px) 80px, 64px"
                  priority
                  className="scale-125 object-cover"
                  unoptimized={/^https?:\/\//.test(data.profileImageUrl)}
                />
              </div>
              <div className="min-w-0 pt-1">
                <div className="flex items-center gap-2">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[var(--primary-400)] text-xs font-bold text-white" aria-hidden="true">M</span>
                  <h2 id="mover-profile-heading" className="text-xl-bold text-[var(--black-400)]">{data.nickname}</h2>
                </div>
                <p className="text-md-medium mt-1 text-[var(--black-300)]" aria-label={t("favorites", { count: data.favoriteCount })}>♥ {data.favoriteCount}</p>
              </div>
            </div>
            <p lang="ko" className="text-lg-semibold mt-4 text-[var(--black-300)] min-[1200px]:mt-3">{data.shortIntroduction}</p>
            <p lang="ko" className="text-md-regular mt-3 max-w-[820px] whitespace-pre-line text-[var(--gray-500)]">{data.description}</p>
            <OriginalTextNotice className="mt-2" />
          </div>

          <div className="flex flex-col gap-2 min-[1200px]:pt-[72px]">
            <Link href={ROUTES.MOVER.PROFILE.EDIT} className="text-2lg-semibold inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl bg-[var(--primary-400)] px-4 text-white transition-colors hover:bg-[#e04829] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl">
              {t("editMyProfile")} <span aria-hidden="true">✎</span>
            </Link>
            <Link href={ROUTES.MOVER.BASIC_INFO_EDIT} className="text-2lg-semibold inline-flex min-h-[54px] items-center justify-center gap-2 rounded-xl border border-[#c4c4c4] px-4 text-[var(--gray-400)] transition-colors hover:bg-[var(--gray-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] min-[1200px]:min-h-[60px] min-[1200px]:rounded-2xl">
              {t("editBasicInfo")} <span aria-hidden="true">✎</span>
            </Link>
          </div>

          <div className="min-[1200px]:col-span-1">
            <h3 className="text-lg-semibold mb-3 text-[var(--black-300)]">{t("activity")}</h3>
            <dl className="grid grid-cols-3 rounded-2xl border border-[var(--line-100)] bg-[var(--background-100)] px-2 py-5 text-center shadow-[2px_2px_8px_rgb(224_224_224_/_20%)] min-[1200px]:py-8">
              <div><dt className="text-md-medium text-[var(--black-300)]">{t("completedMoves")}</dt><dd className="text-xl-bold mt-1 text-[var(--primary-400)]">{t("count", { count: data.confirmedCount })}</dd></div>
              <div><dt className="text-md-medium text-[var(--black-300)]">{t("reviews")}</dt><dd className="text-xl-bold mt-1 text-[var(--primary-400)]">{displayedRating.toFixed(1)}</dd></div>
              <div><dt className="text-md-medium text-[var(--black-300)]">{t("totalExperience")}</dt><dd className="text-xl-bold mt-1 text-[var(--primary-400)]">{t("years", { years: data.careerYears })}</dd></div>
            </dl>

            <div className="mt-6 flex flex-col gap-6 min-[1200px]:mt-10">
              <ProfileTagList title={t("providedServices")} labels={data.serviceLabels} isSelected />
              <ProfileTagList title={t("serviceRegions")} labels={data.regionLabels} />
            </div>
          </div>
        </section>

        <section className="py-6 min-[1200px]:py-10" aria-labelledby="rating-heading">
          <h2 id="rating-heading" className="text-lg-semibold mb-4 text-[var(--black-300)] min-[1200px]:text-xl-bold">{t("reviews")}</h2>
          <div className="grid gap-6 min-[1200px]:grid-cols-[360px_284px] min-[1200px]:gap-x-[98px]">
            <div className="flex items-center gap-4">
              <strong className="text-[40px] font-medium leading-[52px] text-[var(--black-400)]">{displayedRating.toFixed(1)}</strong>
              <div>
                <p className="tracking-wider text-[var(--secondary-yellow-100)]" aria-hidden="true">★★★★★</p>
                <p className="text-md-regular text-[var(--gray-400)]">{t("reviewCount", { count: displayedReviewCount })}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {data.ratingCounts.map(({ score, count }) => (
                <ReviewProgressBar key={score} score={score} count={count} maxCount={maxRatingCount} />
              ))}
            </div>
          </div>

          {reviewError ? (
            <ErrorState title={t("reviewLoadError")} description={reviewError} onRetry={onRetryReviews} />
          ) : isReviewsLoading && !reviews ? (
            <LoadingState message={t("reviewLoading")} />
          ) : currentReviews.length > 0 ? (
            <>
              <div className="mt-6 min-[1200px]:mt-8">
                {currentReviews.map((review) => (
                  <ReviewListCard key={review.id} {...review} size="lg" className="max-w-full" />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} size="sm" isLoading={isReviewsLoading} className="mt-8 justify-center" ariaLabel={t("reviewPagination")} onPageChange={onPageChange} />
            </>
          ) : (
            <EmptyState title={t("noReviews")} description={t("noReviewsDescription")} />
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
