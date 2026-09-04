"use client";

import type { ButtonHTMLAttributes } from "react";

import { SERVICE_TYPE } from "@/common/constants/domain";
import type { ServiceType } from "@/common/constants/domain";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

const DEFAULT_PROFILE_IMAGE = "/images/mover-profile-placeholder.png";

type ClassValue = string | false | null | undefined;

function cn(...classNames: ClassValue[]): string {
  return classNames.filter(Boolean).join(" ");
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

function formatMoveDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 (${WEEKDAY_LABELS[parsedDate.getDay()]})`;
}

type ChipVariant = "service" | "designated";

const CHIP_VARIANT: Record<ChipVariant, { className: string; iconSrc: string }> = {
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
        "xl:gap-1 xl:rounded-md xl:py-1 xl:pl-1.25 xl:text-[14px]/[24px]",
        className,
      )}
    >
      <img src={iconSrc} alt="" className="size-5 shrink-0" />
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
  const isDefaultImage = !src;

  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-xl bg-(--black-300)",
        className,
      )}
    >
      <img
        src={src ?? DEFAULT_PROFILE_IMAGE}
        alt={`${moverName} 기사님 프로필 이미지`}
        className={cn(
          "size-full object-cover",
          isDefaultImage && "translate-y-[11%] scale-150",
        )}
      />
    </div>
  );
}

interface WriteReviewButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  isReviewWritten: boolean;
}

function WriteReviewButton({
  isReviewWritten,
  className,
  ...restProps
}: WriteReviewButtonProps) {
  return (
    <button
      type="button"
      disabled={isReviewWritten}
      className={cn(
        "flex h-13.5 w-full items-center justify-center rounded-xl transition-colors",
        "bg-(--primary-400)! text-(--gray-50)!",
        "text-[16px]/[26px]! font-semibold!",
        "disabled:bg-(--gray-300)!",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)",
        className,
      )}
      {...restProps}
    >
      {isReviewWritten ? "리뷰 작성완료" : "리뷰 작성하기"}
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
        <img
          src="/icons/ic-moving-badge.svg"
          alt=""
          className="size-full object-contain"
        />
      </span>
      <span className="absolute left-1/2 top-1/2 flex h-[7.2px] w-[12.8px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <img
          src="/icons/ic-moving-badge-m.svg"
          alt=""
          className="h-[6.1px] w-[11.6px] object-contain"
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
    <div className="flex flex-col items-start">
      <span className="text-[14px]/[24px] font-normal text-(--gray-500)">
        {label}
      </span>
      <span className="text-[14px]/[24px] font-normal text-(--black-500) md:text-[16px]/[26px]">
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
  return (
    <div className={cn("flex flex-col", className)}>
      <span className={labelClassName}>견적 금액</span>
      <span className={valueClassName}>{formatPrice(price)}</span>
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
  const chipGroup = (
    <>
      <Chip variant="service">{SERVICE_TYPE_LABEL[serviceType]}</Chip>
      {isDesignatedRequest && <Chip variant="designated">지정 견적 요청</Chip>}
    </>
  );

  return (
    <article
      className={cn(
        "flex flex-col gap-5 rounded-[20px] px-5 py-6",
        "border-[0.5px] border-(--line-100) bg-(--gray-50)",
        "shadow-[-2px_-2px_10px_0_rgba(220,220,220,0.2),2px_2px_10px_0_rgba(220,220,220,0.2)]",
        "md:gap-10 md:p-8 xl:gap-6 xl:px-10 xl:py-8",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:gap-6">
        <div className="flex flex-col gap-3 md:gap-6 xl:flex-row xl:items-end xl:gap-2">
          <div className="flex gap-2 md:hidden">{chipGroup}</div>

          <div className="flex items-center gap-2 md:items-start md:gap-5 xl:min-w-0 xl:flex-1 xl:items-end xl:gap-6">
            <div className="order-1 flex min-w-0 flex-1 flex-col md:order-2 md:gap-2">
              <div className="flex min-w-0 flex-col">
                <div className="flex min-w-0 flex-col items-start gap-1 md:flex-row md:items-center md:gap-1.5">
                  <MovingBadge />

                  <p className="max-w-full truncate text-[16px]/[26px] font-semibold text-(--black-300) md:text-[18px]/[26px] md:font-bold">
                    {moverName} 기사님
                  </p>
                </div>

                <p className="truncate text-[12px]/[18px] font-normal text-(--gray-500) md:text-[14px]/[24px]">
                  {moverIntroduction}
                </p>
              </div>

              <div className="hidden gap-2 md:flex">{chipGroup}</div>
            </div>

            <Avatar
              src={profileImageUrl}
              moverName={moverName}
              className="order-2 size-16 md:order-1 md:size-20 xl:size-25"
            />
          </div>

          <PriceBlock
            price={price}
            className="hidden w-40 items-end xl:flex"
            labelClassName="text-[16px]/[26px] font-medium text-(--gray-500)"
            valueClassName="text-[24px]/[32px] font-bold text-(--black-400)"
          />
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4 xl:items-start xl:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4 xl:gap-5">
            <div className="flex gap-4 md:contents">
              <MoveInfoItem label="출발지" value={departure} />
              <MoveInfoDivider className="hidden xl:block" />
              <MoveInfoItem label="도착지" value={arrival} />
            </div>
            <MoveInfoDivider className="hidden md:block" />
            <MoveInfoItem label="이사일" value={formatMoveDate(movedAt)} />
          </div>

          <MoveInfoDivider className="hidden md:block xl:hidden" />

          <PriceBlock
            price={price}
            className="hidden flex-1 items-end md:flex xl:hidden"
            labelClassName="text-[14px]/[24px] font-normal text-(--gray-500)"
            valueClassName="text-[18px]/[26px] font-bold text-(--black-500)"
          />

          <WriteReviewButton
            isReviewWritten={isReviewWritten}
            onClick={onWriteReview}
            className="hidden xl:flex xl:w-40"
          />
        </div>

        <div className="flex items-center justify-between border-t border-(--line-200) pt-5 md:hidden">
          <span className="text-[14px]/[24px] font-medium text-(--gray-400)">
            견적 금액
          </span>
          <span className="text-[18px]/[26px] font-bold text-(--black-400)">
            {formatPrice(price)}
          </span>
        </div>
      </div>

      <WriteReviewButton
        isReviewWritten={isReviewWritten}
        onClick={onWriteReview}
        className="xl:hidden"
      />
    </article>
  );
}
