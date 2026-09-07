import Image from "next/image";

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
  className?: string;
}

function ServiceTypeChip({ serviceType }: { serviceType: ServiceType }) {
  const label = SERVICE_TYPE_LABEL[serviceType];
  const icon = SERVICE_TYPE_ICON[serviceType];
  const bg = SERVICE_TYPE_CHIP_BG[serviceType];

  return (
    <div
      className={[
        bg,
        "flex shrink-0 items-center justify-center gap-0.5 rounded py-0.5 pl-1 pr-[7px]",
        "shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
        "min-[1200px]:gap-1 min-[1200px]:rounded-md min-[1200px]:py-1 min-[1200px]:pl-[5px]",
      ].join(" ")}
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
          "min-[1200px]:text-md-semibold",
        ].join(" ")}
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
        checked={isSelected ?? false}
        onChange={(event) => onSelectChange?.(event.target.checked)}
        className={[
          "size-5 shrink-0 rounded border border-[var(--line-200)] accent-[var(--primary-400)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
        ].join(" ")}
      />
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
        src={src ?? "/images/mover-profile-placeholder.png"}
        alt={alt}
        fill
        sizes="140px"
        className="object-cover"
      />
    </div>
  );
}

function MovingBadge({ className }: { className?: string }) {
  return (
    <span
      className={[
        "relative flex h-[14.56px] w-[12.8px] shrink-0 items-center justify-center",
        "min-[744px]:h-[18.2px] min-[744px]:w-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
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
          "absolute left-1/2 top-1/2 flex h-[5.76px] w-[10.24px] -translate-x-1/2 -translate-y-1/2 items-center justify-center",
          "min-[744px]:h-[7.2px] min-[744px]:w-[12.8px]",
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

function MoverStatsRow({
  rating,
  reviewCount,
  careerYears,
  confirmedCount,
  className,
}: {
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex items-center gap-1.5 min-[744px]:w-full min-[744px]:justify-between min-[744px]:gap-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
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

      <div className="flex items-center gap-1.5 min-[744px]:gap-2">
        <span
          className="h-3.5 w-px shrink-0 bg-[var(--line-200)]"
          aria-hidden="true"
        />
        <div className="text-sm-medium flex items-center gap-1 whitespace-nowrap">
          <span className="text-[#ababab]">경력</span>
          <span className="text-[var(--black-300)]">{careerYears}년</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 min-[744px]:gap-2">
        <span
          className="h-3.5 w-px shrink-0 bg-[var(--line-200)]"
          aria-hidden="true"
        />
        <div className="text-sm-medium flex items-center gap-1 whitespace-nowrap">
          <span className="text-[var(--black-300)]">
            {formatCappedCount(confirmedCount)}건
          </span>
          <span className="text-[#ababab]">확정</span>
        </div>
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
  className,
}: MoverSearchCardProps) {
  const avatarAlt = `${moverName} 기사님 프로필`;

  return (
    <article
      className={[
        "relative flex w-[327px] max-w-full flex-col gap-3 rounded-2xl border-[0.5px] border-[var(--line-100)] bg-[var(--gray-50)] p-5",
        "shadow-[-2px_-2px_10px_rgba(220,220,220,0.2),2px_2px_10px_rgba(220,220,220,0.2)]",
        "min-[1200px]:w-full min-[1200px]:gap-5 min-[1200px]:rounded-[20px] min-[1200px]:px-7 min-[1200px]:py-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-2 min-[1200px]:h-[34px] min-[1200px]:justify-between">
        <ServiceTypeChip serviceType={serviceType} />
        {selectable && (
          <SelectCheckbox
            isSelected={isSelected}
            onSelectChange={onSelectChange}
            label={selectLabel ?? `${moverName} 기사님 선택`}
            className="hidden min-[1200px]:flex"
          />
        )}
      </div>

      <div className="flex w-full flex-col min-[1200px]:hidden">
        <p className="w-full text-lg-semibold text-[var(--black-300)]">
          {introduction}
        </p>
        <p
          className={[
            "hidden w-full overflow-hidden truncate text-[var(--gray-500)]",
            "min-[744px]:block min-[744px]:text-sm-medium",
          ].join(" ")}
        >
          {description}
        </p>
      </div>

      <div
        className="hidden h-px w-full bg-[var(--line-100)] min-[744px]:block min-[1200px]:hidden"
        aria-hidden="true"
      />

      <div className="flex items-stretch gap-2 min-[1200px]:hidden">
        <MoverAvatar
          src={profileImageUrl}
          alt={avatarAlt}
          className="size-[50px]"
        />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div className="flex w-full items-center gap-1 min-[744px]:justify-between">
            <div className="flex items-center gap-1">
              <MovingBadge />
              <p className="text-md-semibold whitespace-nowrap text-[var(--black-300)]">
                {moverName} 기사님
              </p>
            </div>

            <FavoriteButton
              favoriteCount={favoriteCount}
              onFavoriteClick={onFavoriteClick}
              showCount={false}
              size={20}
              className="min-[744px]:hidden"
            />
            <FavoriteButton
              favoriteCount={favoriteCount}
              onFavoriteClick={onFavoriteClick}
              showCount
              size={24}
              className="hidden min-[744px]:flex"
            />
          </div>

          <MoverStatsRow
            rating={rating}
            reviewCount={reviewCount}
            careerYears={careerYears}
            confirmedCount={confirmedCount}
          />
        </div>
      </div>

      <div className="hidden w-full items-start gap-5 min-[1200px]:flex">
        <MoverAvatar
          src={profileImageUrl}
          alt={avatarAlt}
          className="size-[134px]"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-5 self-stretch py-1">
          <div className="flex w-full flex-col">
            <p className="w-full text-xl-semibold text-[var(--black-300)]">
              {introduction}
            </p>
            <p className="text-md-regular w-full overflow-hidden truncate text-[var(--gray-500)]">
              {description}
            </p>
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
    </article>
  );
}
