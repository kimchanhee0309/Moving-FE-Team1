import Image from "next/image";

import type { ServiceType } from "@/common/constants/domain";
import { SERVICE_TYPE } from "@/common/constants/domain";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

const DEFAULT_PROFILE_IMAGE = "/images/mover-profile-placeholder.png";
const STAR_NUMBERS = [1, 2, 3, 4, 5] as const;
const MAX_RATING = STAR_NUMBERS.length;
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;

export interface WrittenReviewCardProps {
  moverName: string;
  profileImageUrl?: string | null;
  moverIntroduction?: string;
  serviceType: ServiceType;
  isDesignatedRequest?: boolean;
  departure: string;
  arrival: string;
  movedAt: string;
  rating: number;
  content: string;
  writtenAt?: string;
  className?: string;
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

function formatWrittenAt(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}. ${month}. ${day}`;
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

function ServiceTypeChip({ serviceType }: { serviceType: ServiceType }) {
  return (
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
        {SERVICE_TYPE_LABEL[serviceType]}
      </span>
    </div>
  );
}

function DesignatedChip() {
  return (
    <div
      className={[
        "flex items-center justify-center bg-[#ffeef0] pr-[7px] shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
        "gap-0.5 rounded py-0.5 pl-1",
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
  );
}

function MoverProfile({
  src,
  moverName,
  size,
}: {
  src?: string | null;
  moverName: string;
  size: 50 | 80;
}) {
  const isDefaultImage = !src;
  const profileSrc = src ?? DEFAULT_PROFILE_IMAGE;
  const isLarge = size === 80;
  const croppedImageSize = isLarge ? 120 : 75;

  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-xl bg-[var(--black-300)]",
        isLarge ? "size-20" : "size-[50px]",
      ].join(" ")}
    >
      {isDefaultImage ? (
        <div
          className={[
            "absolute",
            isLarge
              ? "left-[-20px] top-[-11.2px] size-[120px]"
              : "left-[-12.5px] top-[-7px] size-[75px]",
          ].join(" ")}
        >
          <Image
            src={profileSrc}
            alt={`${moverName} 기사님 프로필`}
            fill
            sizes={`${croppedImageSize}px`}
            quality={100}
            className="object-cover"
          />
        </div>
      ) : (
        <Image
          src={profileSrc}
          alt={`${moverName} 기사님 프로필`}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      )}
    </div>
  );
}

function ChipGroup({
  serviceType,
  isDesignatedRequest,
}: {
  serviceType: ServiceType;
  isDesignatedRequest: boolean;
}) {
  return (
    <>
      <ServiceTypeChip serviceType={serviceType} />
      {isDesignatedRequest ? <DesignatedChip /> : null}
    </>
  );
}

function MoveInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-xs-regular whitespace-nowrap text-center text-[var(--gray-500)] min-[558px]:text-md-regular">
        {label}
      </span>
      <span className="text-sm-medium whitespace-nowrap text-[var(--black-100)] min-[558px]:text-md-medium">
        {value}
      </span>
    </div>
  );
}

function MoveInfoDivider() {
  return (
    <div
      className="hidden h-[50px] w-px shrink-0 bg-[var(--line-200)] min-[558px]:block"
      aria-hidden="true"
    />
  );
}

function StarRating({ rating }: { rating: number }) {
  const filledStarCount = Math.min(MAX_RATING, Math.max(0, Math.round(rating)));

  return (
    <div
      className="flex items-start"
      role="img"
      aria-label={`별점 ${filledStarCount}점`}
    >
      {STAR_NUMBERS.map((starNumber) => (
        <Image
          key={starNumber}
          src="/icons/ic-star.svg"
          alt=""
          width={20}
          height={20}
          className={[
            "size-5 shrink-0 object-contain",
            starNumber > filledStarCount ? "opacity-30" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          unoptimized
        />
      ))}
    </div>
  );
}

export function WrittenReviewCard({
  moverName,
  profileImageUrl,
  moverIntroduction,
  serviceType,
  isDesignatedRequest = false,
  departure,
  arrival,
  movedAt,
  rating,
  content,
  writtenAt,
  className,
}: WrittenReviewCardProps) {
  const moveDateLabel = formatMoveDate(movedAt);
  const writtenAtLabel = writtenAt ? formatWrittenAt(writtenAt) : "";

  return (
    <article
      className={[
        "flex w-full flex-col rounded-[20px] border-[0.5px] border-[var(--line-100)] bg-[var(--gray-50)]",
        "shadow-[-2px_-2px_10px_rgba(220,220,220,0.2),2px_2px_10px_rgba(220,220,220,0.2)]",
        "gap-4 px-5 py-6",
        "min-[558px]:gap-5 min-[558px]:p-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex w-full flex-col gap-3 min-[558px]:hidden">
        <div className="flex items-center gap-2">
          <ChipGroup
            serviceType={serviceType}
            isDesignatedRequest={isDesignatedRequest}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <MovingBadge />
            <p className="text-lg-semibold whitespace-nowrap text-[var(--black-300)]">
              {moverName} 기사님
            </p>
          </div>

          <MoverProfile src={profileImageUrl} moverName={moverName} size={50} />
        </div>
      </div>

      <div className="hidden w-full items-start gap-5 min-[558px]:flex">
        <MoverProfile src={profileImageUrl} moverName={moverName} size={80} />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex w-full flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <MovingBadge />
              <p className="text-2lg-bold whitespace-nowrap text-[var(--black-300)]">
                {moverName} 기사님
              </p>
            </div>

            {moverIntroduction ? (
              <p className="text-md-regular truncate text-[var(--gray-500)]">
                {moverIntroduction}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-1.5">
            <ChipGroup
              serviceType={serviceType}
              isDesignatedRequest={isDesignatedRequest}
            />
          </div>
        </div>
      </div>

      <div
        className="h-px w-full bg-[var(--line-100)] min-[558px]:hidden"
        aria-hidden="true"
      />

      <div className="flex w-full items-center gap-4 min-[558px]:gap-5">
        <MoveInfoItem label="출발지" value={departure} />
        <MoveInfoDivider />
        <MoveInfoItem label="도착지" value={arrival} />
        <MoveInfoDivider />
        <MoveInfoItem label="이사일" value={moveDateLabel} />
      </div>

      <div
        className="h-px w-full bg-[var(--line-100)] min-[558px]:hidden"
        aria-hidden="true"
      />

      <div className="flex w-full flex-col items-start gap-3">
        <StarRating rating={rating} />
        <p className="text-lg-medium w-full text-[var(--black-400)] min-[558px]:text-2lg-medium">
          {content}
        </p>
      </div>

      {writtenAtLabel ? (
        <div className="flex w-full items-center justify-end gap-1.5 min-[558px]:hidden">
          <p className="text-xs-regular whitespace-nowrap text-[#ababab]">
            작성일
          </p>
          <p className="text-xs-regular whitespace-nowrap text-[#ababab]">
            {writtenAtLabel}
          </p>
        </div>
      ) : null}
    </article>
  );
}
