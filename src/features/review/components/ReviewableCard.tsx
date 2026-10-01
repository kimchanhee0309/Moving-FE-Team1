"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ButtonHTMLAttributes } from "react";

import { isRemoteAssetUrl } from "@/common/api/asset-url";
import type { ServiceType } from "@/common/constants/domain";
import { formatDateWithWeekday, SERVICE_TIME_ZONE } from "@/common/utils/date-format";

import { toDisplayRegionAddress } from "../review.utils";

const DEFAULT_PROFILE_IMAGE = "/images/mover-profile-placeholder.png";

type ClassValue = string | false | null | undefined;

function cn(...classNames: ClassValue[]): string {
  return classNames.filter(Boolean).join(" ");
}

function formatMoveDate(date: string, locale: string): string {
  return Number.isNaN(new Date(date).getTime()) ? "" : formatDateWithWeekday(date, locale, SERVICE_TIME_ZONE);
}

type ChipVariant = "service" | "designated";

const CHIP_VARIANT: Record<
  ChipVariant,
  { className: string; iconSrc: string }
> = {
  service: {
    className: "bg-(--primary-100) text-(--primary-400)",
    iconSrc: "/icons/ic-solid-box.svg",
  },
  designated: {
    className: "bg-[#ffeef0] text-[#ff4f64]",
    iconSrc: "/icons/ic-solid-document.svg",
  },
};

interface ChipProps {
  variant: ChipVariant;
  children: string;
}

function Chip({ variant, children }: ChipProps) {
  const { className, iconSrc } = CHIP_VARIANT[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-0.5 rounded py-0.5 pl-1 pr-1.75",
        "text-[13px]/[22px] font-semibold",
        "drop-shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
        "min-[1200px]:gap-1 min-[1200px]:rounded-md min-[1200px]:py-1 min-[1200px]:pl-1.25 min-[1200px]:text-[14px]/[24px]",
        className,
      )}
    >
      <Image
        src={iconSrc}
        alt=""
        width={20}
        height={20}
        className="size-5 shrink-0 object-contain"
        unoptimized
      />
      {children}
    </span>
  );
}

interface AvatarProps {
  src?: string | null;
  moverName: string;
  className?: string;
}

function Avatar({ src, moverName, className }: AvatarProps) {
  const t = useTranslations("Quote");
  const isDefaultImage = !src;
  const profileSrc = src ?? DEFAULT_PROFILE_IMAGE;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl bg-(--black-300)",
        className,
      )}
    >
      <Image
        src={profileSrc}
        alt={t("moverProfile", { name: moverName })}
        fill
        sizes="(min-width: 1280px) 150px, (min-width: 768px) 120px, 96px"
        quality={isDefaultImage ? 100 : 75}
        className={cn(
          "object-cover",
          isDefaultImage && "translate-y-[11%] scale-150",
        )}
        unoptimized={isRemoteAssetUrl(src)}
      />
    </div>
  );
}

interface WriteReviewButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isReviewWritten: boolean;
}

function WriteReviewButton({
  isReviewWritten,
  className,
  ...restProps
}: WriteReviewButtonProps) {
  const t = useTranslations("Review");

  return (
    <button
      type="button"
      disabled={isReviewWritten}
      className={cn(
        "flex h-13.5 w-full cursor-pointer items-center justify-center rounded-xl",
        "bg-(--primary-400)! text-(--gray-50)!",
        "text-[16px]/[26px]! font-semibold!",
        // 공통 Button solid hover(#e04829)와 맞춤
        "transition-colors hover:bg-[#e04829]!",
        "disabled:cursor-not-allowed disabled:bg-(--gray-300)! disabled:hover:bg-(--gray-300)!",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)",
        className,
      )}
      {...restProps}
    >
      {isReviewWritten ? t("written") : t("write")}
    </button>
  );
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

interface MoveInfoItemProps {
  label: string;
  value: string;
}

function MoveInfoItem({ label, value }: MoveInfoItemProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start">
      <span className="text-[14px]/[24px] font-normal text-(--gray-500)">
        {label}
      </span>
      <span
        className="w-full truncate text-[14px]/[24px] font-normal text-(--black-500) min-[744px]:text-[16px]/[26px]"
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

function MoveInfoDivider({ className }: { className: string }) {
  return (
    <div
      className={cn("h-12.5 w-px shrink-0 bg-(--line-100)", className)}
      aria-hidden="true"
    />
  );
}

interface PriceBlockProps {
  price: number;
  className: string;
  labelClassName: string;
  valueClassName: string;
}

function PriceBlock({
  price,
  className,
  labelClassName,
  valueClassName,
}: PriceBlockProps) {
  const t = useTranslations("Quote");

  return (
    <div className={cn("flex flex-col", className)}>
      <span className={labelClassName}>{t("price")}</span>
      <span className={valueClassName}>{t("priceValue", { price })}</span>
    </div>
  );
}

export interface ReviewableCardProps {
  moverName: string;
  moverIntroduction: string;
  profileImageUrl?: string | null;
  serviceType: ServiceType;
  isDesignatedRequest?: boolean;
  departure: string;
  arrival: string;
  movedAt: string;
  price: number;
  isReviewWritten?: boolean;
  onWriteReview: () => void;
  className?: string;
}

export function ReviewableCard({
  moverName,
  moverIntroduction,
  profileImageUrl,
  serviceType,
  isDesignatedRequest = false,
  departure,
  arrival,
  movedAt,
  price,
  isReviewWritten = false,
  onWriteReview,
  className,
}: ReviewableCardProps) {
  const t = useTranslations("Quote");
  const moveType = useTranslations("MoveType");
  const locale = useLocale();
  const chipGroup = (
    <>
      <Chip variant="service">{moveType(serviceType)}</Chip>
      {isDesignatedRequest && <Chip variant="designated">{moveType("designated")}</Chip>}
    </>
  );

  return (
    <article
      className={cn(
        "flex w-full min-w-0 flex-col gap-5 rounded-[20px] px-5 py-6",
        "border-[0.5px] border-(--line-100) bg-(--gray-50)",
        "shadow-[-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]",
        "min-[744px]:gap-10 min-[744px]:p-8 min-[1200px]:gap-6 min-[1200px]:px-10 min-[1200px]:py-8",
        className,
      )}
    >
      <div className="flex flex-col gap-3 min-[744px]:gap-6">
        <div className="flex flex-col gap-3 min-[744px]:gap-6 min-[1200px]:flex-row min-[1200px]:items-end min-[1200px]:gap-2">
          <div className="flex gap-2 min-[744px]:hidden">{chipGroup}</div>

          <div className="flex items-center gap-2 min-[744px]:items-start min-[744px]:gap-5 min-[1200px]:min-w-0 min-[1200px]:flex-1 min-[1200px]:items-end min-[1200px]:gap-6">
            <div className="order-1 flex min-w-0 flex-1 flex-col min-[744px]:order-2 min-[744px]:gap-2">
              <div className="flex min-w-0 flex-col">
                <div className="flex min-w-0 flex-col items-start gap-1 min-[744px]:flex-row min-[744px]:items-center min-[744px]:gap-1.5">
                  <MovingBadge />

                  <p className="max-w-full truncate text-[16px]/[26px] font-semibold text-(--black-300) min-[744px]:text-[18px]/[26px] min-[744px]:font-bold">
                    {t("moverName", { name: moverName })}
                  </p>
                </div>

                <p className="truncate text-[12px]/[18px] font-normal text-(--gray-500) min-[744px]:text-[14px]/[24px]">
                  {moverIntroduction}
                </p>
              </div>

              <div className="hidden gap-2 min-[744px]:flex">{chipGroup}</div>
            </div>

            <Avatar
              src={profileImageUrl}
              moverName={moverName}
              className="order-2 size-16 min-[744px]:order-1 min-[744px]:size-20 min-[1200px]:size-25"
            />
          </div>

          <PriceBlock
            price={price}
            className="hidden w-40 items-end min-[1200px]:flex"
            labelClassName="text-[16px]/[26px] font-medium text-(--gray-500)"
            valueClassName="text-[24px]/[32px] font-bold text-(--black-400)"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4 min-[744px]:flex-row min-[744px]:items-center min-[744px]:gap-4 min-[1200px]:items-start min-[1200px]:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-4 min-[744px]:flex-row min-[744px]:items-center min-[744px]:gap-4 min-[1200px]:gap-5">
            <div className="flex min-w-0 flex-1 gap-4 min-[744px]:contents">
              <MoveInfoItem
                label={t("from")}
                value={toDisplayRegionAddress(departure)}
              />
              <MoveInfoDivider className="hidden min-[1200px]:block" />
              <MoveInfoItem
                label={t("to")}
                value={toDisplayRegionAddress(arrival)}
              />
            </div>
            <MoveInfoDivider className="hidden min-[744px]:block" />
            <MoveInfoItem label={t("moveDate")} value={formatMoveDate(movedAt, locale)} />
          </div>

          <MoveInfoDivider className="hidden min-[744px]:block min-[1200px]:hidden" />

          <PriceBlock
            price={price}
            className="hidden shrink-0 items-end min-[744px]:flex min-[1200px]:hidden"
            labelClassName="text-[14px]/[24px] font-normal text-(--gray-500)"
            valueClassName="text-[18px]/[26px] font-bold text-(--black-500)"
          />

          <WriteReviewButton
            isReviewWritten={isReviewWritten}
            onClick={onWriteReview}
            className="hidden min-[1200px]:flex min-[1200px]:w-40"
          />
        </div>

        <div className="flex items-center justify-between border-t border-(--line-200) pt-5 min-[744px]:hidden">
          <span className="text-[14px]/[24px] font-medium text-(--gray-400)">
            {t("price")}
          </span>
          <span className="text-[18px]/[26px] font-bold text-(--black-400)">
            {t("priceValue", { price })}
          </span>
        </div>
      </div>

      <WriteReviewButton
        isReviewWritten={isReviewWritten}
        onClick={onWriteReview}
        className="min-[1200px]:hidden"
      />
    </article>
  );
}
