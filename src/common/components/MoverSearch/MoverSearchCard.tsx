"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

import type { ServiceType } from "@/common/constants/domain";
import { SERVICE_TYPE } from "@/common/constants/domain";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

const SERVICE_TYPE_ICON: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "/icons/ic-solid-box.svg",
  [SERVICE_TYPE.HOME]: "/icons/ic-solid-box.svg",
  [SERVICE_TYPE.OFFICE]: "/icons/mover-search/ic-solid-company.svg",
};

const SERVICE_TYPE_CHIP_BG: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "bg-[var(--primary-100)]",
  [SERVICE_TYPE.HOME]: "bg-[var(--primary-100)]",
  [SERVICE_TYPE.OFFICE]: "bg-[#ffeef0]",
};

export type MoverSearchCardSize = "sm";

export interface MoverSearchCardProps {
  serviceType: ServiceType;
  moverName: string;
  introduction: string;
  description: string;
  profileImageUrl?: string | null;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
  onFavoriteClick?: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelectChange?: (isSelected: boolean) => void;
  selectLabel?: string;
  size?: MoverSearchCardSize;
  className?: string;
}

function ServiceTypeChip({
  serviceType,
  isSm,
}: {
  serviceType: ServiceType;
  isSm: boolean;
}) {
  const label = SERVICE_TYPE_LABEL[serviceType];
  const icon = SERVICE_TYPE_ICON[serviceType];
  const bg = SERVICE_TYPE_CHIP_BG[serviceType];

  return (
    <div
      className={[
        bg,
        "flex h-[26px] shrink-0 items-center justify-center gap-0.5 rounded py-0.5 pl-1 pr-[7px]",
        "shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
        !isSm &&
          "min-[744px]:h-8 min-[744px]:gap-1 min-[744px]:rounded-md min-[744px]:py-1 min-[744px]:pl-[5px]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={icon}
        alt=""
        width={20}
        height={20}
        className="size-5 shrink-0 object-contain"
        unoptimized
      />
      <span
        className={[
          "text-sm-semibold whitespace-nowrap text-[var(--primary-400)]",
          !isSm &&
            "min-[744px]:text-[14px] min-[744px]:leading-6 min-[744px]:font-semibold",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

function SelectCheckbox({
  isSelected,
  onSelectChange,
  label,
  className,
}: {
  isSelected?: boolean;
  onSelectChange?: (isSelected: boolean) => void;
  label: string;
  className?: string;
}) {
  const isChecked = isSelected ?? false;

  return (
    <label
      className={[
        "flex size-9 shrink-0 cursor-pointer items-center justify-center",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(event) => onSelectChange?.(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={[
          "flex size-5 shrink-0 items-center justify-center rounded-[4px] border bg-[var(--gray-50)]",
          "border-[var(--line-200)]",
          "peer-checked:border-[var(--primary-400)] peer-checked:bg-[var(--primary-400)]",
          "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--black-400)]",
        ].join(" ")}
      >
        {isChecked && (
          <svg
            viewBox="0 0 12 12"
            className="size-3"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.2 3.2 4.8 8.6 1.8 5.6l.9-.9 2.1 2.1 4.5-4.5.9.9Z"
              fill="var(--gray-50)"
            />
          </svg>
        )}
      </span>
    </label>
  );
}

function MoverAvatar({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-xl bg-[var(--black-300)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={src ?? "/images/mover-search/profile-placeholder.png"}
        alt={alt}
        fill
        sizes="140px"
        className="object-cover"
      />
    </div>
  );
}

function MovingBadge({ compact }: { compact?: boolean }) {
  return (
    <span
      className={[
        "relative flex shrink-0 items-center justify-center",
        compact ? "h-[14.56px] w-[12.8px]" : "h-[18.2px] w-4",
      ].join(" ")}
      aria-hidden="true"
    >
      <Image
        src="/icons/ic-moving-badge.svg"
        alt=""
        fill
        sizes="20px"
        className="object-contain"
        unoptimized
      />
      <span
        className={[
          "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center",
          compact ? "h-[5.76px] w-[10.24px]" : "h-[7.2px] w-[12.8px]",
        ].join(" ")}
      >
        <Image
          src="/icons/ic-moving-badge-m.svg"
          alt=""
          fill
          sizes="16px"
          className="object-contain"
          unoptimized
        />
      </span>
    </span>
  );
}

function FavoriteButton({
  favoriteCount,
  onFavoriteClick,
  showCount,
  size,
  className,
}: {
  favoriteCount: number;
  onFavoriteClick?: () => void;
  showCount: boolean;
  size: 20 | 24;
  className?: string;
}) {
  const iconSizeClass = size === 24 ? "size-6" : "size-5";
  const content = (
    <>
      <span className={["relative shrink-0", iconSizeClass].join(" ")}>
        <Image
          src="/icons/ic-like.svg"
          alt=""
          fill
          sizes={`${size}px`}
          className="object-contain"
          unoptimized
        />
      </span>
      {showCount && (
        <span className="text-md-regular whitespace-nowrap text-[var(--gray-500)]">
          {favoriteCount}
        </span>
      )}
    </>
  );

  const sharedClassName = ["flex items-center gap-0.5", className]
    .filter(Boolean)
    .join(" ");

  if (onFavoriteClick) {
    return (
      <button
        type="button"
        onClick={onFavoriteClick}
        className={sharedClassName}
        aria-label="찜하기"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={sharedClassName} aria-hidden={showCount ? undefined : true}>
      {content}
    </div>
  );
}

function formatCappedCount(count: number, cap = 999): string {
  return count > cap ? `${cap}+` : count.toLocaleString("ko-KR");
}

function useIsSingleLine(text: string) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isOneLine, setIsOneLine] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      const height = el.getBoundingClientRect().height;
      if (!Number.isFinite(lineHeight) || lineHeight <= 0 || height === 0) {
        return;
      }
      setIsOneLine(Math.round(height / lineHeight) <= 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return { ref, isOneLine };
}

function CardDescription({
  description,
  className,
  addOneLineBottomPadding = false,
}: {
  description: string;
  className: string;
  addOneLineBottomPadding?: boolean;
}) {
  const { ref, isOneLine } = useIsSingleLine(description);

  return (
    <div className={addOneLineBottomPadding && isOneLine ? "pb-5" : undefined}>
      <p ref={ref} className={className}>
        {description}
      </p>
    </div>
  );
}

function MoverStatsRow({
  rating,
  reviewCount,
  careerYears,
  confirmedCount,
  dividerInset,
}: {
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  dividerInset: 6 | 8;
}) {
  const dividerClass = [
    "h-3.5 w-px shrink-0 bg-[var(--line-200)]",
    dividerInset === 6 ? "mx-1.5" : "mx-2",
  ].join(" ");

  return (
    <div className="flex items-center">
      <div className="flex items-center gap-0.5">
        <span className="relative block size-5 shrink-0">
          <Image
            src="/icons/ic-star.svg"
            alt=""
            fill
            sizes="20px"
            className="object-contain"
            unoptimized
          />
        </span>
        <span className="text-sm-medium flex items-center gap-0.5 whitespace-nowrap">
          <span className="text-[var(--black-300)]">{rating.toFixed(1)}</span>
          <span className="text-[#ababab]">
            ({formatCappedCount(reviewCount)})
          </span>
        </span>
      </div>

      <span className={dividerClass} aria-hidden="true" />

      <div className="text-sm-medium flex items-center gap-1 whitespace-nowrap">
        <span className="text-[#ababab]">경력</span>
        <span className="text-[var(--black-300)]">{careerYears}년</span>
      </div>

      <span className={dividerClass} aria-hidden="true" />

      <div className="text-sm-medium flex items-center gap-1 whitespace-nowrap">
        <span className="text-[var(--black-300)]">
          {formatCappedCount(confirmedCount)}건
        </span>
        <span className="text-[#ababab]">확정</span>
      </div>
    </div>
  );
}

export function MoverSearchCard({
  serviceType,
  moverName,
  introduction,
  description,
  profileImageUrl,
  rating,
  reviewCount,
  careerYears,
  confirmedCount,
  favoriteCount,
  onFavoriteClick,
  selectable = false,
  isSelected,
  onSelectChange,
  selectLabel,
  size,
  className,
}: MoverSearchCardProps) {
  const isSm = size === "sm";
  const avatarAlt = `${moverName} 기사님 프로필`;
  const checkboxLabel = selectLabel ?? `${moverName} 기사님 선택`;

  return (
    <article
      className={[
        "relative flex flex-col border-[0.5px] border-[var(--line-100)] bg-[var(--gray-50)]",
        "shadow-[-2px_-2px_10px_rgba(220,220,220,0.2),2px_2px_10px_rgba(220,220,220,0.2)]",
        isSm
          ? "w-[327px] max-w-full items-end gap-3 rounded-2xl p-5"
          : [
              "box-border w-[327px] min-w-[327px] max-w-[327px] shrink-0 gap-2 rounded-2xl p-5",
              "min-[744px]:w-full min-[744px]:min-w-0 min-[744px]:max-w-full min-[744px]:gap-5 min-[744px]:rounded-[20px] min-[744px]:px-7 min-[744px]:py-6",
            ].join(" "),
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "flex w-full items-center justify-between",
          !isSm && "min-[744px]:h-[34px]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ServiceTypeChip serviceType={serviceType} isSm={isSm} />
        {selectable && (
          <SelectCheckbox
            isSelected={isSelected}
            onSelectChange={onSelectChange}
            label={checkboxLabel}
          />
        )}
      </div>

      {isSm ? (
        <div className="flex w-full flex-col gap-4">
          <p className="text-lg-semibold line-clamp-1 w-full min-w-0 text-[var(--black-300)]">
            {introduction}
          </p>
          <div className="flex items-center gap-2">
            <MoverAvatar
              src={profileImageUrl}
              alt={avatarAlt}
              className="size-[50px]"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex w-full items-center gap-1">
                <div className="flex items-center gap-1">
                  <MovingBadge compact />
                  <p className="text-md-semibold whitespace-nowrap text-[var(--black-300)]">
                    {moverName} 기사님
                  </p>
                </div>
                <FavoriteButton
                  favoriteCount={favoriteCount}
                  onFavoriteClick={onFavoriteClick}
                  showCount={false}
                  size={20}
                />
              </div>
              <MoverStatsRow
                rating={rating}
                reviewCount={reviewCount}
                careerYears={careerYears}
                confirmedCount={confirmedCount}
                dividerInset={6}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex w-full flex-col gap-4 min-[744px]:hidden">
            <div className="flex w-full flex-col">
              <p className="text-lg-semibold line-clamp-1 w-full min-w-0 text-[var(--black-300)]">
                {introduction}
              </p>
              <p className="text-sm-medium line-clamp-2 w-full min-w-0 text-[var(--gray-500)]">
                {description}
              </p>
            </div>

            <div
              className="h-px w-full bg-[var(--line-100)]"
              aria-hidden="true"
            />

            <div className="flex items-stretch gap-2">
              <MoverAvatar
                src={profileImageUrl}
                alt={avatarAlt}
                className="size-[50px]"
              />
              <div className="flex w-fit min-w-0 flex-col justify-center gap-1">
                <div className="flex w-0 min-w-full items-center justify-between gap-1">
                  <div className="flex min-w-0 items-center gap-1">
                    <MovingBadge />
                    <p className="text-md-semibold min-w-0 truncate whitespace-nowrap text-[var(--black-300)]">
                      {moverName} 기사님
                    </p>
                  </div>
                  <FavoriteButton
                    favoriteCount={favoriteCount}
                    onFavoriteClick={onFavoriteClick}
                    showCount
                    size={24}
                    className="shrink-0"
                  />
                </div>
                <MoverStatsRow
                  rating={rating}
                  reviewCount={reviewCount}
                  careerYears={careerYears}
                  confirmedCount={confirmedCount}
                  dividerInset={8}
                />
              </div>
            </div>
          </div>

          <div className="hidden w-full items-start gap-5 min-[744px]:flex">
            <MoverAvatar
              src={profileImageUrl}
              alt={avatarAlt}
              className="size-[134px]"
            />
            <div className="flex min-w-0 flex-1 flex-col self-stretch">
              <div className="flex w-full flex-col">
                <p className="text-xl-semibold line-clamp-1 w-full min-w-0 text-[var(--black-300)]">
                  {introduction}
                </p>
                <CardDescription
                  description={description}
                  addOneLineBottomPadding
                  className="text-md-regular line-clamp-2 w-full min-w-0 text-[var(--gray-500)]"
                />
              </div>
              <div className="flex w-full items-end justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <MovingBadge />
                    <p className="text-lg-semibold whitespace-nowrap text-[var(--black-300)]">
                      {moverName} 기사님
                    </p>
                  </div>
                  <MoverStatsRow
                    rating={rating}
                    reviewCount={reviewCount}
                    careerYears={careerYears}
                    confirmedCount={confirmedCount}
                    dividerInset={8}
                  />
                </div>
                <FavoriteButton
                  favoriteCount={favoriteCount}
                  onFavoriteClick={onFavoriteClick}
                  showCount
                  size={24}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
