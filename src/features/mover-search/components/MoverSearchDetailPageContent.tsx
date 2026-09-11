"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";
import type { ServiceType } from "@/common/constants/domain";
import { ROUTES } from "@/common/constants/routes";
import { authHref } from "@/features/auth/auth.utils";
import { useAuth } from "@/features/auth/hooks/useAuth";

import {
  useMoverSearchDesignatedRequest,
  useMoverSearchDetail,
} from "../hooks/useMoverSearchDetail";
import { useMoverSearchFavorites } from "../hooks/useMoverSearchSidebar";
import {
  createKakaoShareUrl,
  createMoverDetailShareUrl,
  REGION_FILTER_OPTIONS,
  SERVICE_TYPE_LABEL,
} from "../mover-search.constants";
import {
  getDisplayedFavoriteCount,
  getMoverSearchViewer,
} from "../mover-search.utils";
import { CopyLinkToast } from "./CopyLinkToast";
import { DesignatedRequestGuideModal } from "./DesignatedRequestGuideModal";
import { MoverSearchDetailReviews } from "./MoverSearchDetailReviews";
import {
  MoverSearchDetailCompactShare,
  MoverSearchDetailSidebar,
  MoverSearchDetailStickyBar,
} from "./MoverSearchDetailSidebar";

interface MoverSearchDetailPageContentProps {
  moverId: string;
  mockHasGeneralQuote?: boolean;
}

export function MoverSearchDetailPageContent({
  moverId,
  mockHasGeneralQuote = false,
}: MoverSearchDetailPageContentProps) {
  const router = useRouter();
  const { user, isPending: isAuthPending, error: authError } = useAuth();
  const viewer = getMoverSearchViewer(user, isAuthPending, Boolean(authError));
  const isCustomer = viewer === "customer";
  const canInteractFavorite = viewer === "guest" || viewer === "customer";

  const {
    mover,
    isDetailPending,
    isDetailError,
    refetchDetail,
    reviewSummary,
    isReviewPending,
  } = useMoverSearchDetail(moverId);
  const favoritesQuery = useMoverSearchFavorites(user?.id, isCustomer);
  const designatedQuery = useMoverSearchDesignatedRequest(
    user?.id,
    isCustomer,
    mockHasGeneralQuote,
  );

  const [reviewPaging, setReviewPaging] = useState({ moverId, page: 1 });
  const reviewPage = reviewPaging.moverId === moverId ? reviewPaging.page : 1;
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const detailHref = ROUTES.PUBLIC.MOVER_DETAIL(moverId);
  const isFavorite = favoritesQuery.favoriteIdSet.has(moverId);
  const isDesignatedComplete = designatedQuery.designatedIdSet.has(moverId);

  const handleFavoriteClick = () => {
    if (viewer === "pending") {
      return;
    }
    if (viewer === "guest") {
      router.push(authHref(ROUTES.AUTH.LOGIN.CUSTOMER, detailHref));
      return;
    }
    if (viewer !== "customer") {
      return;
    }
    favoritesQuery.toggleFavorite(moverId);
  };

  const handleDesignatedClick = () => {
    if (viewer === "pending" || isDesignatedComplete) {
      return;
    }
    if (viewer === "guest") {
      router.push(authHref(ROUTES.AUTH.LOGIN.CUSTOMER, detailHref));
      return;
    }
    if (viewer !== "customer") {
      return;
    }
    if (!designatedQuery.hasGeneralQuote) {
      setIsGuideOpen(true);
      return;
    }
    designatedQuery.completeDesignated(moverId);
  };

  const getShareUrl = () =>
    createMoverDetailShareUrl(window.location.origin, detailHref);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setIsToastVisible(true);
    } catch {
      setIsToastVisible(false);
    }
  };

  const handleShareKakao = () => {
    window.open(
      createKakaoShareUrl(getShareUrl()),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (isDetailPending) {
    return <LoadingState message="기사님 정보를 불러오는 중이에요." />;
  }

  if (isDetailError) {
    return (
      <ErrorState
        title="기사님 정보를 불러오지 못했어요."
        onRetry={() => void refetchDetail()}
      />
    );
  }

  if (!mover) {
    return (
      <EmptyState
        title="기사님을 찾을 수 없어요."
        description="목록에서 다른 기사님을 선택해 주세요."
      />
    );
  }

  const displayedFavoriteCount = getDisplayedFavoriteCount(
    mover.favoriteCount,
    mover.id,
    isFavorite,
    isCustomer,
  );
  const primaryService = mover.serviceTypes[0] ?? mover.serviceType;
  const reviews = reviewSummary?.reviews ?? [];
  const ratingCounts = reviewSummary?.ratingCounts ?? [];

  return (
    <div className="bg-[var(--gray-50)] pb-[110px] min-[1200px]:pb-16">
      <CopyLinkToast
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
      <DesignatedRequestGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onRequestNormalQuote={() => {
          setIsGuideOpen(false);
          router.push(ROUTES.CUSTOMER.MOVE_REQUEST);
        }}
      />

      <div
        aria-hidden="true"
        className="h-[122px] w-full bg-[length:100%_100%] bg-center bg-[url('/images/mover-search/banner-mobile.png')] min-[744px]:hidden"
      />
      <div
        aria-hidden="true"
        className="hidden h-[157px] w-full bg-[length:100%_100%] bg-center bg-[url('/images/mover-search/banner-tablet.png')] min-[744px]:block min-[1200px]:hidden"
      />
      <div
        aria-hidden="true"
        className="hidden h-[180px] w-full bg-cover bg-center bg-[url('/images/mover-quote/quote-detail-banner.svg')] min-[1200px]:block"
      />

      <div className="mx-auto w-full max-w-[1200px] px-5 min-[744px]:px-[72px] min-[1200px]:px-0">
        <div className="-mt-[42px] flex flex-col min-[744px]:-mt-[77px] min-[1200px]:-mt-[83px]">
          <div className="relative z-10 mb-[13px] flex size-16 items-center justify-center overflow-hidden rounded-xl bg-[var(--black-300)] p-0.5 min-[744px]:mb-[23px] min-[744px]:size-[100px] min-[744px]:p-1 min-[1200px]:mb-5 min-[1200px]:size-[134px] min-[1200px]:rounded-[12px] min-[1200px]:p-1.5">
            <Image
              src={mover.profileImageUrl ?? "/images/mover-search/profile-placeholder.png"}
              alt={`${mover.moverName} 기사님 프로필`}
              width={134}
              height={134}
              className="size-full object-contain"
              priority
            />
          </div>

          <div className="flex flex-col gap-10 min-[1200px]:flex-row min-[1200px]:items-start min-[1200px]:gap-[53px]">
            <div className="flex min-w-0 flex-1 flex-col gap-8 min-[1200px]:gap-10">
              <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 min-[744px]:gap-5">
                <div className="flex flex-col gap-2 min-[744px]:gap-3">
                  <ServiceTypeChip serviceType={primaryService} />
                  <p className="text-2lg-semibold text-[var(--black-300)] min-[744px]:text-2xl-semibold">
                    {mover.introduction}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MovingBadge />
                    <p className="text-lg-semibold text-[var(--black-300)] min-[744px]:text-2lg-semibold">
                      {mover.moverName} 기사님
                    </p>
                  </div>
                  <p
                    className="text-md-medium flex items-center gap-1 text-[var(--content-muted)] min-[744px]:text-2lg-medium"
                    aria-label={`찜 ${displayedFavoriteCount}명`}
                  >
                    {displayedFavoriteCount}
                    <Image
                      src="/icons/button/like-sm.svg"
                      alt=""
                      width={24}
                      height={24}
                      className="size-6"
                    />
                  </p>
                </div>

                <p className="text-md-regular whitespace-pre-line text-[var(--content-muted)] min-[744px]:text-lg-regular">
                  {mover.detailDescription}
                </p>
              </div>

              <dl className="flex h-[95px] items-center justify-between gap-2 rounded-xl border border-[var(--line-200)] bg-[var(--gray-50)] px-10 min-[744px]:h-[120px] min-[744px]:rounded-2xl min-[744px]:px-[100px]">
                <div className="flex flex-col items-center text-center">
                  <dt className="text-sm-medium text-[var(--content-muted)] min-[744px]:text-lg-regular min-[744px]:text-[var(--black-300)]">진행</dt>
                  <dd className="text-lg-semibold text-[var(--black-300)] min-[744px]:text-xl-bold">
                    {mover.confirmedCount}건
                  </dd>
                </div>
                <div className="flex flex-col items-center text-center">
                  <dt className="text-sm-medium text-[var(--content-muted)] min-[744px]:text-lg-regular min-[744px]:text-[var(--black-300)]">리뷰</dt>
                  <dd className="flex items-center gap-0.5 min-[744px]:gap-1.5">
                    <Image
                      src="/icons/ic-star.svg"
                      alt=""
                      width={24}
                      height={24}
                      className="size-5 min-[744px]:size-6"
                    />
                    <span className="text-lg-semibold text-[var(--black-300)] min-[744px]:text-xl-bold">
                      {mover.rating.toFixed(1)}
                    </span>
                    <span className="text-md-medium text-[var(--content-placeholder)] min-[744px]:text-lg-medium">
                      ({mover.reviewCount})
                    </span>
                  </dd>
                </div>
                <div className="flex flex-col items-center text-center">
                  <dt className="text-sm-medium text-[var(--content-muted)] min-[744px]:text-lg-regular min-[744px]:text-[var(--black-300)]">총 경력</dt>
                  <dd className="text-lg-semibold text-[var(--black-300)] min-[744px]:text-xl-bold">
                    {mover.careerYears}년
                  </dd>
                </div>
              </dl>
            </div>

            <ChipGroup
              title="제공 서비스"
              labels={mover.serviceTypes.map((type) => SERVICE_TYPE_LABEL[type])}
              variant="service"
            />
            <ChipGroup
              title="서비스 가능 지역"
              labels={mover.regionValues.map(getRegionLabel)}
              variant="region"
            />

            <hr className="w-full border-0 border-t border-[var(--line-200)] min-[1200px]:hidden" />

            <div className="min-[1200px]:hidden">
              <MoverSearchDetailCompactShare
                onCopyLink={() => void handleCopyLink()}
                onShareKakao={() => void handleShareKakao()}
                onShareFacebook={handleShareFacebook}
              />
            </div>

            <hr className="w-full border-0 border-t border-[var(--line-200)]" />

            <MoverSearchDetailReviews
              rating={mover.rating}
              reviewCount={mover.reviewCount}
              ratingCounts={ratingCounts}
              reviews={reviews}
              currentPage={reviewPage}
              onPageChange={(page) => setReviewPaging({ moverId, page })}
              isLoading={isReviewPending}
            />
            </div>

            <div className="hidden min-[1200px]:block">
              <MoverSearchDetailSidebar
                moverName={mover.moverName}
                isDesignatedComplete={isDesignatedComplete}
                canToggleFavorite={canInteractFavorite}
                isFavorite={isFavorite}
                onDesignatedClick={handleDesignatedClick}
                onFavoriteClick={handleFavoriteClick}
                onCopyLink={() => void handleCopyLink()}
                onShareKakao={() => void handleShareKakao()}
                onShareFacebook={handleShareFacebook}
              />
            </div>
          </div>
        </div>
      </div>

      <MoverSearchDetailStickyBar
        isDesignatedComplete={isDesignatedComplete}
        canToggleFavorite={canInteractFavorite}
        isFavorite={isFavorite}
        onDesignatedClick={handleDesignatedClick}
        onFavoriteClick={handleFavoriteClick}
      />
    </div>
  );
}

function getRegionLabel(value: string) {
  return (
    REGION_FILTER_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

function ServiceTypeChip({ serviceType }: { serviceType: ServiceType }) {
  return (
    <span className="inline-flex h-[26px] w-fit items-center gap-0.5 rounded bg-[var(--primary-100)] py-0.5 pr-[7px] pl-1 shadow-[4px_4px_4px_rgba(217,217,217,0.1)] min-[744px]:h-8 min-[744px]:gap-1 min-[744px]:rounded-md min-[744px]:py-1 min-[744px]:pr-[7px] min-[744px]:pl-[5px]">
      <Image
        src="/icons/ic-solid-box.svg"
        alt=""
        width={20}
        height={20}
        className="size-5"
      />
      <span className="text-sm-semibold text-[var(--primary-400)] min-[744px]:text-md-semibold">
        {SERVICE_TYPE_LABEL[serviceType]}
      </span>
    </span>
  );
}

function MovingBadge() {
  return (
    <span
      className="relative flex h-[18.2px] w-4 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <Image
        src="/icons/ic-moving-badge.svg"
        alt=""
        fill
        sizes="20px"
        className="object-contain"
      />
      <span className="absolute top-1/2 left-1/2 flex h-[7.2px] w-[12.8px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <Image
          src="/icons/ic-moving-badge-m.svg"
          alt=""
          fill
          sizes="16px"
          className="object-contain"
        />
      </span>
    </span>
  );
}

function ChipGroup({
  title,
  labels,
  variant,
}: {
  title: string;
  labels: string[];
  variant: "service" | "region";
}) {
  return (
    <div className="flex flex-col gap-2 min-[744px]:gap-4">
      <h2 className="text-lg-semibold text-[var(--content-strong)] min-[744px]:text-xl-semibold">{title}</h2>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0 min-[744px]:gap-3">
        {labels.map((label) => (
          <li
            key={label}
            className={
              variant === "service"
                ? "text-md-medium rounded-full border border-[var(--primary-400)] bg-[var(--primary-100)] px-3 py-1.5 text-[var(--primary-400)] min-[744px]:text-2lg-medium min-[744px]:px-5 min-[744px]:py-2.5"
                : "text-md-medium rounded-full border border-[var(--gray-300)] bg-[var(--background-100)] px-3 py-1.5 text-[var(--content-strong)] min-[744px]:text-2lg-regular min-[744px]:px-5 min-[744px]:py-2.5"
            }
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
