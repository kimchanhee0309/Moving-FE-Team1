import Image from "next/image";

import type { QuoteStatus, ServiceType } from "@/common/constants/domain";
import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

const SERVICE_TYPE_ICON: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "/icons/ic-solid-box.svg",
  [SERVICE_TYPE.HOME]: "/icons/ic-solid-box.svg",
  [SERVICE_TYPE.OFFICE]: "/icons/ic-solid-company.svg",
};

export interface QuoteHistoryCardProps {
  serviceType: ServiceType;
  isDesignated?: boolean;
  status: QuoteStatus;
  message: string;
  moverName: string;
  moverProfileImageUrl?: string | null;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
  price: number;
  onFavoriteClick?: () => void;
  className?: string;
}

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

function StatusBadge({ status }: { status: QuoteStatus }) {
  if (status === QUOTE_STATUS.CONFIRMED) {
    return (
      <div className="flex shrink-0 items-center justify-center gap-1 rounded-md px-2 shadow-[4px_4px_4px_rgba(217,217,217,0.1)]">
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
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center justify-center rounded-md px-2 shadow-[4px_4px_4px_rgba(217,217,217,0.1)]">
      <span className="text-lg-semibold whitespace-nowrap text-[var(--gray-400)]">
        견적대기
      </span>
    </div>
  );
}

export function QuoteHistoryCard({
  serviceType,
  isDesignated = false,
  status,
  message,
  moverName,
  moverProfileImageUrl,
  rating,
  reviewCount,
  careerYears,
  confirmedCount,
  favoriteCount,
  price,
  onFavoriteClick,
  className,
}: QuoteHistoryCardProps) {
  const serviceTypeLabel = SERVICE_TYPE_LABEL[serviceType];
  const serviceTypeIcon = SERVICE_TYPE_ICON[serviceType];
  const profileSrc =
    moverProfileImageUrl ?? "/images/mover-profile-placeholder.png";
  const priceLabel = `${price.toLocaleString("ko-KR")}원`;
  const ratingLabel = rating.toFixed(1);

  const favoriteContent = (
    <>
      <Image
        src="/icons/ic-like.svg"
        alt=""
        width={24}
        height={24}
        className="size-6 object-contain"
        unoptimized
      />
      <span
        className={[
          "text-md-regular whitespace-nowrap",
          "text-[var(--gray-500)]",
          "min-[660px]:text-[var(--black-500)]",
        ].join(" ")}
      >
        {favoriteCount}
      </span>
    </>
  );

  return (
    <article
      className={[
        "flex w-full flex-col items-end bg-[var(--gray-50)] py-5",
        "min-[660px]:px-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col gap-4 min-[660px]:gap-5">
        <div className="flex w-full flex-col gap-4 min-[660px]:gap-5">
          <div className="flex w-full items-center gap-2">
            <div
              className={[
                "flex shrink-0 items-center justify-center bg-[var(--primary-100)] pr-[7px] shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
                "gap-0.5 rounded py-0.5 pl-1",
                "min-[660px]:gap-1 min-[660px]:rounded-md min-[660px]:py-1 min-[660px]:pl-[5px]",
              ].join(" ")}
            >
              <Image
                src={serviceTypeIcon}
                alt=""
                width={20}
                height={20}
                className="size-5 shrink-0 object-contain"
                unoptimized
              />
              <span className="whitespace-nowrap text-[var(--primary-400)]">
                <span className="text-sm-semibold min-[660px]:hidden">
                  {serviceTypeLabel}
                </span>
                <span className="hidden text-md-semibold min-[660px]:inline">
                  {serviceTypeLabel}
                </span>
              </span>
            </div>

            {isDesignated && (
              <div
                className={[
                  "flex shrink-0 items-center justify-center bg-[#ffeef0] pr-[7px] shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
                  "rounded py-0.5 pl-1",
                  "min-[660px]:gap-1 min-[660px]:rounded-md min-[660px]:py-1 min-[660px]:pl-[5px]",
                ].join(" ")}
              >
                <Image
                  src="/icons/ic-solid-document.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 shrink-0 object-contain"
                  unoptimized
                />
                <span className="whitespace-nowrap text-[#ff4f64]">
                  <span className="text-sm-semibold min-[660px]:hidden">
                    지정 견적 요청
                  </span>
                  <span className="hidden text-md-semibold min-[660px]:inline">
                    지정 견적 요청
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col items-start min-[660px]:flex-row min-[660px]:items-center min-[660px]:justify-between">
              <p className="text-[var(--black-300)]">
                <span className="text-lg-semibold min-[660px]:hidden">
                  {message}
                </span>
                <span className="hidden text-2lg-semibold min-[660px]:inline">
                  {message}
                </span>
              </p>
              <div className="hidden min-[660px]:block">
                <StatusBadge status={status} />
              </div>
            </div>

            <div className="flex w-full flex-col items-start justify-center rounded-xl border border-[var(--gray-300)] py-3 pl-3 pr-5">
              <div className="flex w-full items-end gap-3">
                <div className="relative size-[50px] shrink-0 overflow-hidden rounded-xl bg-[var(--black-300)]">
                  <Image
                    src={profileSrc}
                    alt={`${moverName} 기사님 프로필`}
                    width={50}
                    height={50}
                    className="size-full object-cover"
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1 min-[660px]:gap-2">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-1">
                      <MovingBadge />
                      <p className="text-[var(--black-300)]">
                        <span className="text-md-semibold min-[660px]:hidden">
                          {moverName} 기사님
                        </span>
                        <span className="hidden text-lg-semibold min-[660px]:inline">
                          {moverName} 기사님
                        </span>
                      </p>
                    </div>

                    {onFavoriteClick ? (
                      <button
                        type="button"
                        onClick={onFavoriteClick}
                        className="flex items-center justify-center gap-0.5"
                        aria-label="찜하기"
                      >
                        {favoriteContent}
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-0.5">
                        {favoriteContent}
                      </div>
                    )}
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
                      <div className="text-sm-medium flex items-center gap-0.5 whitespace-nowrap">
                        <span className="text-[var(--black-300)]">
                          {ratingLabel}
                        </span>
                        <span className="text-[var(--gray-400)]">
                          ({reviewCount})
                        </span>
                      </div>
                    </div>

                    <span
                      className="h-3.5 w-px bg-[var(--line-200)]"
                      aria-hidden="true"
                    />

                    <div className="text-sm-medium flex items-center gap-1 whitespace-nowrap">
                      <span className="text-[var(--gray-400)]">경력</span>
                      <span className="text-[var(--black-300)]">
                        {careerYears}년
                      </span>
                    </div>

                    <span
                      className="h-3.5 w-px bg-[var(--line-200)]"
                      aria-hidden="true"
                    />

                    <div className="text-sm-medium flex items-center gap-1 whitespace-nowrap">
                      <span className="text-[var(--black-300)]">
                        {confirmedCount.toLocaleString("ko-KR")}건
                      </span>
                      <span className="text-[var(--gray-400)]">확정</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-8 w-full items-center justify-between min-[660px]:justify-end min-[660px]:gap-3">
          <div className="min-[660px]:hidden">
            <StatusBadge status={status} />
          </div>

          <div className="flex items-center gap-3">
            <p className="text-md-medium text-[var(--gray-500)]">견적 금액</p>
            <p className="text-[var(--black-400)]">
              <span className="text-2lg-bold min-[660px]:hidden">{priceLabel}</span>
              <span className="hidden text-2xl-bold min-[660px]:inline">
                {priceLabel}
              </span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
