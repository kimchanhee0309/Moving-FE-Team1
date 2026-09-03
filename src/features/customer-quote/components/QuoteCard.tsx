import Image from "next/image";

import type { QuoteStatus, ServiceType } from "@/common/constants/domain";
import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

export interface QuoteCardProps {
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
  onConfirm?: () => void;
  onDetail?: () => void;
  onFavoriteClick?: () => void;
  isConfirmDisabled?: boolean;
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
      <div className="flex shrink-0 items-center justify-center gap-1 rounded-md px-2 py-1 shadow-[4px_4px_4px_rgba(217,217,217,0.1)]">
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
      <span className="text-lg-semibold whitespace-nowrap text-[#ababab]">
        견적대기
      </span>
    </div>
  );
}

export function QuoteCard({
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
  onConfirm,
  onDetail,
  onFavoriteClick,
  isConfirmDisabled = false,
  className,
}: QuoteCardProps) {
  const serviceTypeLabel = SERVICE_TYPE_LABEL[serviceType];
  const profileSrc =
    moverProfileImageUrl ?? "/images/mover-profile-placeholder.png";
  const priceLabel = `${price.toLocaleString("ko-KR")}원`;
  const ratingLabel = rating.toFixed(1);

  return (
    <article
      className={[
        "flex w-full flex-col rounded-[20px] border-[0.5px] border-[var(--line-100)] bg-[var(--gray-50)]",
        "shadow-[-2px_-2px_10px_rgba(220,220,220,0.2),2px_2px_10px_rgba(220,220,220,0.2)]",
        "gap-7 px-5 py-6",
        "min-[558px]:gap-10 min-[558px]:px-10 min-[558px]:py-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col gap-2 min-[558px]:gap-3">
        <div className="flex w-full flex-col gap-4 min-[558px]:gap-6">
          <div className="flex w-full items-center justify-between min-[558px]:h-[34px]">
            <div className="flex items-center gap-2">
              <div
                className={[
                  "flex items-center justify-center bg-[var(--primary-100)] pr-[7px] shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
                  "gap-0.5 rounded py-0.5 pl-1",
                  "min-[558px]:gap-1 min-[558px]:rounded-md min-[558px]:py-1 min-[558px]:pl-[5px]",
                ].join(" ")}
              >
                <Image
                  src="/icons/ic-solid-box.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 shrink-0 object-contain"
                  unoptimized
                />
                <span
                  className={[
                    "whitespace-nowrap text-[var(--primary-400)]",
                    "text-sm-semibold",
                    "min-[558px]:text-md-semibold",
                  ].join(" ")}
                >
                  {serviceTypeLabel}
                </span>
              </div>

              {isDesignated && (
                <div
                  className={[
                    "flex items-center justify-center bg-[#ffeef0] pr-[7px] shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
                    "rounded py-0.5 pl-1",
                    "min-[558px]:gap-1 min-[558px]:rounded-md min-[558px]:py-1 min-[558px]:pl-[5px]",
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
                  <span
                    className={[
                      "whitespace-nowrap text-[#ff4f64]",
                      "text-sm-semibold",
                      "min-[558px]:text-md-semibold",
                    ].join(" ")}
                  >
                    지정 견적 요청
                  </span>
                </div>
              )}
            </div>

            <StatusBadge status={status} />
          </div>

          <div className="flex w-full flex-col gap-1">
            <p
              className={[
                "w-full text-[var(--black-300)]",
                "text-lg-semibold",
                "min-[558px]:text-2lg-semibold",
              ].join(" ")}
            >
              {message}
            </p>

            <div className="flex w-full items-center gap-2 border-b border-[var(--line-200)] pb-5 pt-3">
              <div className="relative size-[50px] shrink-0 overflow-hidden rounded-xl bg-[var(--black-300)]">
                <Image
                  src={profileSrc}
                  alt={`${moverName} 기사님 프로필`}
                  width={50}
                  height={50}
                  className="size-full object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MovingBadge />
                    <p className="text-md-semibold whitespace-nowrap text-[var(--black-300)]">
                      {moverName} 기사님
                    </p>
                  </div>

                  {onFavoriteClick ? (
                    <button
                      type="button"
                      onClick={onFavoriteClick}
                      className="flex items-center justify-center gap-0.5"
                      aria-label="찜하기"
                    >
                      <Image
                        src="/icons/ic-like.svg"
                        alt=""
                        width={24}
                        height={24}
                        className="size-6 object-contain"
                        unoptimized
                      />
                      <span className="text-md-regular whitespace-nowrap text-[var(--gray-500)]">
                        {favoriteCount}
                      </span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-center gap-0.5">
                      <Image
                        src="/icons/ic-like.svg"
                        alt=""
                        width={24}
                        height={24}
                        className="size-6 object-contain"
                        unoptimized
                      />
                      <span className="text-md-regular whitespace-nowrap text-[var(--gray-500)]">
                        {favoriteCount}
                      </span>
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
                      <span className="text-[var(--black-300)]">{ratingLabel}</span>
                      <span className="text-[#ababab]">({reviewCount})</span>
                    </div>
                  </div>

                  <span
                    className="h-3.5 w-px bg-[var(--line-200)]"
                    aria-hidden="true"
                  />

                  <div className="text-sm-medium flex items-center gap-1 whitespace-nowrap">
                    <span className="text-[#ababab]">경력</span>
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
                    <span className="text-[#ababab]">확정</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-end justify-end">
          <div className="flex w-full flex-1 items-center justify-between min-[558px]:items-end">
            <p
              className={[
                "text-md-medium text-[#ababab]",
                "min-[558px]:text-lg-medium min-[558px]:text-[var(--black-400)]",
              ].join(" ")}
            >
              견적 금액
            </p>
            <p
              className={[
                "shrink-0 whitespace-nowrap text-[var(--black-400)]",
                "text-[20px] font-bold leading-8",
                "min-[558px]:text-[24px]",
              ].join(" ")}
            >
              {priceLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-[11px] min-[558px]:flex-row">
        <button
          type="button"
          onClick={onDetail}
          className={[
            "order-2 flex h-[54px] w-full items-center justify-center rounded-xl border border-[var(--primary-400)] px-6 py-4",
            "text-lg-semibold text-center text-[var(--primary-400)] shadow-[4px_4px_10px_rgba(195,217,242,0.2)]",
            "min-[558px]:order-1 min-[558px]:min-w-0 min-[558px]:flex-1",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
          ].join(" ")}
        >
          상세보기
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          className={[
            "order-1 flex h-[54px] w-full items-center justify-center rounded-xl bg-[var(--primary-400)] p-4",
            "text-lg-semibold text-center text-[var(--gray-50)]",
            "min-[558px]:order-2 min-[558px]:min-w-0 min-[558px]:flex-1",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          견적 확정하기
        </button>
      </div>
    </article>
  );
}
