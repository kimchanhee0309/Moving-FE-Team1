"use client";

import Image from "next/image";
import type { ReactNode } from "react";

import {
  DESIGNATED_REQUEST_CHIP,
  MoveTypeChip,
} from "@/common/components/MoveTypeChip";
import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

interface CustomerQuoteDetailViewProps {
  quoteId: string;
  /**
   * `pending`은 활성 요청 상세(확정 CTA).
   * `history`는 받았던 견적 상세(조회만). 뱃지는 `status`를 따릅니다.
   */
  variant?: "pending" | "history";
  status?: QuoteStatus;
}

interface QuoteDetailMock {
  serviceType: ServiceType;
  isDesignated: boolean;
  status: QuoteStatus;
  message: string;
  moverName: string;
  profileImageUrl: string;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
  price: number;
  requestedAt: string;
  serviceLabel: string;
  moveDateLabel: string;
  from: string;
  to: string;
}

/**
 * 견적 상세 UI입니다. API가 아직 없어서 Figma 카피로 화면만 구성합니다.
 * 대기 상세는 node 1:9115, 확정 상세는 node 1:11818입니다.
 */
const MOCK_QUOTE: QuoteDetailMock = {
  serviceType: SERVICE_TYPE.SMALL,
  isDesignated: true,
  status: QUOTE_STATUS.PENDING,
  message: "고객님의 물품을 안전하게 운송해 드립니다.",
  moverName: "김코드",
  profileImageUrl: "/images/customer-quote/mover-profile.png",
  rating: 5,
  reviewCount: 178,
  careerYears: 7,
  confirmedCount: 334,
  favoriteCount: 136,
  price: 180000,
  requestedAt: "24.08.26",
  serviceLabel: "사무실이사",
  moveDateLabel: "2024. 08. 26(월) 오전 10:00",
  from: "서울 중구 삼일대로 343",
  to: "서울 강남구 선릉로 428",
};

function MovingBadge() {
  return (
    <span
      className="relative flex h-[23px] w-5 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <span className="relative h-[18.2px] w-4">
        <Image
          src="/icons/ic-moving-badge.svg"
          alt=""
          width={16}
          height={18}
          className="size-full object-contain"
          unoptimized
        />
      </span>
      <span className="absolute left-1/2 top-1/2 flex h-[7.2px] w-[12.8px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <Image
          src="/icons/ic-moving-badge-m.svg"
          alt=""
          width={12}
          height={6}
          className="h-[6.1px] w-[11.6px] object-contain"
          unoptimized
        />
      </span>
    </span>
  );
}

function QuoteInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-center gap-[23px]">
      <dt className="text-lg-regular w-[90px] shrink-0 text-[var(--content-placeholder)]">
        {label}
      </dt>
      <dd className="text-lg-semibold text-[var(--black-400)]">{value}</dd>
    </div>
  );
}

function ShareButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={[
        "flex size-16 shrink-0 items-center justify-center rounded-2xl",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function StatusBadge({ isConfirmed }: { isConfirmed: boolean }) {
  if (isConfirmed) {
    return (
      <span className="flex shrink-0 items-center justify-center gap-1 rounded-md px-2 py-1 shadow-[4px_4px_4px_rgba(217,217,217,0.1)]">
        <Image
          src="/icons/ic-check-confirmed.svg"
          alt=""
          width={20}
          height={20}
          className="size-5 object-contain"
          unoptimized
        />
        <span className="text-lg-bold whitespace-nowrap text-[var(--primary-400)]">
          확정견적
        </span>
      </span>
    );
  }

  return (
    <span className="text-lg-semibold shrink-0 rounded-md px-2 text-[var(--content-placeholder)] shadow-[4px_4px_4px_rgba(217,217,217,0.1)]">
      견적대기
    </span>
  );
}

export function CustomerQuoteDetailView({
  quoteId,
  variant = "pending",
  status = QUOTE_STATUS.PENDING,
}: CustomerQuoteDetailViewProps) {
  const isConfirmed = status === QUOTE_STATUS.CONFIRMED;
  const canConfirm = variant === "pending";
  const priceLabel = `${MOCK_QUOTE.price.toLocaleString("ko-KR")}원`;
  const ratingLabel = MOCK_QUOTE.rating.toFixed(1);

  const getShareUrl = () => {
    return window.location.href;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
  };

  const handleShareKakao = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(
      `https://story.kakao.com/s/share?url=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main className="min-h-screen bg-[var(--gray-50)]">
      <header className="bg-[var(--gray-50)] py-8 shadow-[0_2px_10px_rgba(248,248,248,0.1)]">
        <div
          className={[
            "px-6",
            "min-[744px]:px-[72px]",
            "min-[1200px]:px-[clamp(72px,18.75vw,360px)]",
          ].join(" ")}
        >
          <h1 className="text-2xl-semibold text-[var(--black-500)]">
            견적 상세
          </h1>
        </div>
      </header>

      <div className="h-[180px] bg-[var(--primary-400)]" aria-hidden="true" />

      <div
        className={[
          "px-6 pb-10",
          "min-[744px]:px-[72px]",
          "min-[1200px]:px-[clamp(72px,18.75vw,360px)]",
        ].join(" ")}
      >
        <div className="-mt-[83px] flex flex-col gap-10 min-[1200px]:flex-row min-[1200px]:items-start min-[1200px]:gap-10">
          <section className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="relative mb-5 size-[134px] shrink-0 overflow-hidden rounded-xl bg-[var(--black-300)]">
              <Image
                src={MOCK_QUOTE.profileImageUrl}
                alt={`${MOCK_QUOTE.moverName} 기사님 프로필`}
                width={134}
                height={134}
                className="size-[134px] object-cover"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <MoveTypeChip variant={MOCK_QUOTE.serviceType} size="md" />
                {MOCK_QUOTE.isDesignated ? (
                  <MoveTypeChip
                    variant={DESIGNATED_REQUEST_CHIP}
                    size="md"
                  />
                ) : null}
              </div>
              <div className="flex w-full items-center justify-between gap-3">
                <p className="text-2xl-semibold text-[var(--black-300)]">
                  {MOCK_QUOTE.message}
                </p>
                <StatusBadge isConfirmed={isConfirmed} />
              </div>
            </div>

            <div className="h-px w-full bg-[var(--line-200)]" />

            <div className="flex flex-col gap-2">
              <div className="flex w-full items-start justify-between">
                <div className="flex items-center gap-1">
                  <MovingBadge />
                  <p className="text-2lg-semibold text-[var(--black-300)]">
                    {MOCK_QUOTE.moverName} 기사님
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2lg-medium text-[var(--content-muted)]">
                    {MOCK_QUOTE.favoriteCount}
                  </span>
                  <Image
                    src="/icons/ic-like.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="size-6 object-contain"
                    unoptimized
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Image
                    src="/icons/ic-star.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 object-contain"
                    unoptimized
                  />
                  <p className="text-md-medium flex items-center gap-0.5 whitespace-nowrap">
                    <span className="text-[var(--black-300)]">{ratingLabel}</span>
                    <span className="text-[var(--content-placeholder)]">
                      ({MOCK_QUOTE.reviewCount})
                    </span>
                  </p>
                </div>
                <span
                  className="h-3.5 w-px bg-[var(--line-200)]"
                  aria-hidden="true"
                />
                <p className="text-md-medium flex items-center gap-1 whitespace-nowrap">
                  <span className="text-[var(--content-placeholder)]">경력</span>
                  <span className="text-[var(--black-300)]">
                    {MOCK_QUOTE.careerYears}년
                  </span>
                </p>
                <span
                  className="h-3.5 w-px bg-[var(--line-200)]"
                  aria-hidden="true"
                />
                <p className="text-md-medium flex items-center gap-1 whitespace-nowrap">
                  <span className="text-[var(--black-300)]">
                    {MOCK_QUOTE.confirmedCount.toLocaleString("ko-KR")}건
                  </span>
                  <span className="text-[var(--content-placeholder)]">확정</span>
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-[var(--line-200)]" />

            <div className="flex items-center gap-[61px]">
              <h2 className="text-xl-semibold text-[var(--black-400)]">견적가</h2>
              <p className="text-2xl-bold text-[var(--black-400)]">{priceLabel}</p>
            </div>

            <div className="h-px w-full bg-[var(--line-200)]" />

            <div className="flex flex-col gap-6">
              <h2 className="text-xl-semibold text-[var(--black-400)]">
                견적 정보
              </h2>
              <dl className="flex flex-col gap-4">
                <QuoteInfoRow label="견적 요청일" value={MOCK_QUOTE.requestedAt} />
                <QuoteInfoRow label="서비스" value={MOCK_QUOTE.serviceLabel} />
                <QuoteInfoRow label="이용일" value={MOCK_QUOTE.moveDateLabel} />
                <QuoteInfoRow label="출발지" value={MOCK_QUOTE.from} />
                <QuoteInfoRow label="도착지" value={MOCK_QUOTE.to} />
              </dl>
            </div>

            <p className="sr-only">견적 번호 {quoteId}</p>
          </section>

          <aside
            className={[
              "flex w-full shrink-0 flex-col min-[1200px]:w-[320px]",
              /* 이력 상세(1:11818): 공유는 프로필이 아니라 본문 쪽. 프로필 top 281, 공유 top 485. */
              canConfirm ? "" : "min-[1200px]:mt-[204px]",
            ].join(" ")}
          >
            {canConfirm ? (
              <>
                <div className="flex flex-col">
                  <p className="text-2lg-semibold text-[var(--content-placeholder)]">
                    견적가
                  </p>
                  <p className="text-2xl-bold text-[var(--black-400)]">
                    {priceLabel}
                  </p>
                </div>
                <button
                  type="button"
                  className={[
                    "mt-[87px] flex h-16 w-full items-center justify-center rounded-2xl bg-[var(--primary-400)] p-4",
                    "text-2lg-semibold text-[var(--gray-50)]",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
                  ].join(" ")}
                >
                  견적 확정하기
                </button>
                <div className="mt-10 h-px w-full bg-[var(--line-200)]" />
              </>
            ) : null}
            <div
              className={[
                "flex flex-col gap-[22px]",
                canConfirm ? "mt-10" : "",
              ].join(" ")}
            >
              <h2 className="text-xl-semibold text-[var(--black-400)]">
                견적서 공유하기
              </h2>
              <div className="flex items-start gap-4">
                <ShareButton
                  label="링크 복사"
                  onClick={() => {
                    void handleCopyLink();
                  }}
                  className="border border-[var(--line-200)] bg-[var(--gray-50)] p-2.5"
                >
                  <span className="relative flex size-9 items-center justify-center">
                    <Image
                      src="/icons/customer-quote/ic-clip.svg"
                      alt=""
                      width={24}
                      height={11}
                      className="h-[11px] w-6 object-contain"
                      unoptimized
                    />
                  </span>
                </ShareButton>
                <ShareButton
                  label="카카오톡으로 공유"
                  onClick={handleShareKakao}
                  className="bg-[#fae100] p-3.5"
                >
                  <Image
                    src="/icons/customer-quote/ic-kakao.svg"
                    alt=""
                    width={28}
                    height={26}
                    className="h-7 w-7 object-contain"
                    unoptimized
                  />
                </ShareButton>
                <ShareButton
                  label="페이스북으로 공유"
                  onClick={handleShareFacebook}
                  className="bg-[var(--primary-400)] p-3.5"
                >
                  <span className="relative flex size-7 items-center justify-center">
                    <Image
                      src="/icons/customer-quote/ic-facebook.svg"
                      alt=""
                      width={14}
                      height={27}
                      className="h-[26.6px] w-3.5 object-contain"
                      unoptimized
                    />
                  </span>
                </ShareButton>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
