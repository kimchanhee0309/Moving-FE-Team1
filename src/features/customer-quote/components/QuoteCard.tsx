import Image from "next/image";
import { useTranslations } from "next-intl";

import { isRemoteAssetUrl } from "@/common/api/asset-url";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";
import { QUOTE_STATUS } from "@/common/constants/domain";

const DEFAULT_PROFILE_IMAGE = "/images/mover-profile-placeholder.png";

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
  const t = useTranslations("Quote");

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
          {t("confirmed")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center justify-center rounded-md px-2 shadow-[4px_4px_4px_rgba(217,217,217,0.1)]">
      <span className="text-lg-semibold whitespace-nowrap text-[var(--gray-400)]">
        {t("pending")}
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
  const t = useTranslations("Quote");
  const moveType = useTranslations("MoveType");
  const serviceTypeLabel = moveType(serviceType);
  const profileSrc = moverProfileImageUrl ?? DEFAULT_PROFILE_IMAGE;
  const priceLabel = t("priceValue", { price });
  const displayMessage = message || t("defaultMessage");
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
                <span className="whitespace-nowrap text-[var(--primary-400)]">
                  <span className="text-sm-semibold min-[558px]:hidden">
                    {serviceTypeLabel}
                  </span>
                  <span className="hidden text-md-semibold min-[558px]:inline">
                    {serviceTypeLabel}
                  </span>
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
                  <span className="whitespace-nowrap text-[#ff4f64]">
                    <span className="text-sm-semibold min-[558px]:hidden">
                      {moveType("designated")}
                    </span>
                    <span className="hidden text-md-semibold min-[558px]:inline">
                      {moveType("designated")}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <StatusBadge status={status} />
          </div>

          <div className="flex w-full flex-col gap-1">
            <p className="w-full text-[var(--black-300)]">
              <span className="text-lg-semibold min-[558px]:hidden">{displayMessage}</span>
              <span className="hidden text-2lg-semibold min-[558px]:inline">
                {displayMessage}
              </span>
            </p>

            <div className="flex w-full items-center gap-2 border-b border-[var(--line-200)] pb-5 pt-3">
              <div className="relative size-[50px] shrink-0 overflow-hidden rounded-xl bg-[var(--black-300)]">
                <Image
                  src={profileSrc}
                  alt={t("moverProfile", { name: moverName })}
                  width={50}
                  height={50}
                  className="size-full object-cover"
                  unoptimized={isRemoteAssetUrl(profileSrc)}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-1">
                    <MovingBadge />
                    <p className="text-md-semibold whitespace-nowrap text-[var(--black-300)]">
                      {t("moverName", { name: moverName })}
                    </p>
                  </div>

                  {onFavoriteClick ? (
                    <button
                      type="button"
                      onClick={onFavoriteClick}
                      className="flex items-center justify-center gap-0.5"
                      aria-label={t("favorite")}
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
                    <span className="text-[var(--gray-400)]">{t("career")}</span>
                    <span className="text-[var(--black-300)]">
                      {t("careerYears", { count: careerYears })}
                    </span>
                  </div>

                  <span
                    className="h-3.5 w-px bg-[var(--line-200)]"
                    aria-hidden="true"
                  />

                  <div className="text-sm-medium flex items-center gap-1 whitespace-nowrap">
                    <span className="text-[var(--black-300)]">
                      {t("confirmedCount", { count: confirmedCount })}
                    </span>
                    <span className="text-[var(--gray-400)]">{t("confirmedLabel")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-end justify-end">
          <div className="flex w-full flex-1 items-center justify-between min-[558px]:items-end">
            <p>
              <span className="text-md-medium text-[var(--gray-400)] min-[558px]:hidden">
                {t("price")}
              </span>
              <span className="text-lg-medium hidden text-[var(--black-400)] min-[558px]:inline">
                {t("price")}
              </span>
            </p>
            <p className="shrink-0 whitespace-nowrap text-[var(--black-400)]">
              <span className="text-xl-bold min-[558px]:hidden">{priceLabel}</span>
              <span className="hidden text-2xl-bold min-[558px]:inline">
                {priceLabel}
              </span>
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
          {t("detail")}
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={isConfirmDisabled}
          className={[
            "order-1 flex h-[54px] w-full items-center justify-center rounded-xl bg-[var(--primary-400)] p-4",
            "text-lg-semibold text-center text-[var(--gray-50)] transition-colors",
            "enabled:hover:bg-[#e04829]",
            "min-[558px]:order-2 min-[558px]:min-w-0 min-[558px]:flex-1",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
        >
          {t("confirm")}
        </button>
      </div>
    </article>
  );
}
