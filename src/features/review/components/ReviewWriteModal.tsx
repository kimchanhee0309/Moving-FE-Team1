"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

import type { ServiceType } from "@/common/constants/domain";
import { SERVICE_TYPE } from "@/common/constants/domain";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

const DEFAULT_PROFILE_IMAGE = "/images/mover-profile-placeholder.png";
const STAR_NUMBERS = [1, 2, 3, 4, 5] as const;
const MIN_CONTENT_LENGTH = 10;
const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const FOCUS_RING =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]";
const SECTION_TITLE =
  "text-lg-semibold text-[var(--black-300)] min-[558px]:text-2lg-semibold";
const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type ClassValue = string | false | null | undefined;

function cn(...classNames: ClassValue[]) {
  return classNames.filter(Boolean).join(" ");
}

function formatMoveDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}년 ${m}월 ${d}일 (${WEEKDAY_LABELS[parsed.getDay()]})`;
}

function useModalAccessibility(isOpen: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const prevFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const nodes = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKeyDown);
      prevFocus?.focus();
    };
  }, [isOpen, onClose]);

  return dialogRef;
}

function Chip({
  iconSrc,
  label,
  tone,
}: {
  iconSrc: string;
  label: string;
  tone: "service" | "designated";
}) {
  const isService = tone === "service";
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-0.5 rounded py-0.5 pl-1 pr-[7px]",
        "shadow-[4px_4px_4px_rgba(217,217,217,0.1)]",
        "min-[558px]:gap-1 min-[558px]:rounded-md min-[558px]:py-1 min-[558px]:pl-[5px]",
        isService ? "bg-[var(--primary-100)]" : "bg-[#ffeef0]",
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
      <span
        className={cn(
          "text-sm-semibold whitespace-nowrap min-[558px]:text-md-semibold",
          isService ? "text-[var(--primary-400)]" : "text-[#ff4f64]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function MoveInfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-xs-regular whitespace-nowrap text-center text-[var(--gray-500)] min-[558px]:text-md-regular">
        {label}
      </span>
      <span className="text-sm-medium whitespace-nowrap text-[var(--black-500)] min-[558px]:text-lg-regular">
        {value}
      </span>
    </div>
  );
}

function FieldSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <p className={SECTION_TITLE}>{title}</p>
      {children}
    </div>
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

function ProfileAvatar({
  src,
  alt,
  isDefault,
}: {
  src: string;
  alt: string;
  isDefault: boolean;
}) {
  return (
    <div className="relative size-[50px] shrink-0 overflow-hidden rounded-xl bg-[var(--black-300)]">
      <div
        className={cn(
          "absolute",
          isDefault ? "left-[-12.5px] top-[-7px] size-[75px]" : "inset-0",
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={isDefault ? "75px" : "50px"}
          className="object-cover"
        />
      </div>
    </div>
  );
}

function StarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div className="flex items-start" role="group" aria-label="평점 선택">
      {STAR_NUMBERS.map((starNumber) => {
        const isActive = starNumber <= rating;
        return (
          <button
            key={starNumber}
            type="button"
            onClick={() => onChange(starNumber)}
            aria-label={`${starNumber}점`}
            aria-pressed={isActive}
            className={cn(
              "relative size-6 shrink-0 min-[558px]:size-9",
              FOCUS_RING,
            )}
          >
            <Image
              src="/icons/ic-star.svg"
              alt=""
              width={36}
              height={36}
              className={cn(
                "pointer-events-none size-full select-none object-contain [-webkit-user-drag:none]",
                !isActive && "opacity-25 grayscale",
              )}
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
              unoptimized
            />
          </button>
        );
      })}
    </div>
  );
}

export interface ReviewWriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  moverName: string;
  profileImageUrl?: string | null;
  serviceType: ServiceType;
  isDesignatedRequest?: boolean;
  departure: string;
  arrival: string;
  movedAt: string;
  rating: number;
  content: string;
  onRatingChange: (rating: number) => void;
  onContentChange: (content: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function ReviewWriteModal({
  isOpen,
  onClose,
  moverName,
  profileImageUrl,
  serviceType,
  isDesignatedRequest = false,
  departure,
  arrival,
  movedAt,
  rating,
  content,
  onRatingChange,
  onContentChange,
  onSubmit,
  isSubmitting = false,
  closeOnBackdrop = true,
  className,
}: ReviewWriteModalProps) {
  const titleId = useId();
  const contentId = useId();
  const dialogRef = useModalAccessibility(isOpen, onClose);
  const canSubmit =
    rating >= 1 &&
    content.trim().length >= MIN_CONTENT_LENGTH &&
    !isSubmitting;
  const profileSrc = profileImageUrl ?? DEFAULT_PROFILE_IMAGE;
  const isDefaultProfile = !profileImageUrl;

  if (!isOpen) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdrop && event.target === event.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 min-[558px]:items-center min-[558px]:p-6"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex w-full max-w-[375px] flex-col gap-[26px] bg-[var(--gray-50)]",
          "rounded-t-[32px] px-6 py-8 shadow-[4px_4px_5px_rgba(169,169,169,0.2)]",
          "min-[558px]:max-w-[600px] min-[558px]:gap-10 min-[558px]:rounded-[32px] min-[558px]:p-8",
          className,
        )}
      >
        <div className="flex w-full items-center justify-between">
          <h2
            id={titleId}
            className="text-2lg-bold text-[var(--black-400)] min-[558px]:text-2xl-semibold"
          >
            리뷰 쓰기
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={cn(
              "relative flex size-6 shrink-0 items-center justify-center min-[558px]:size-9",
              FOCUS_RING,
            )}
          >
            <span
              className="absolute h-px w-3 rotate-45 bg-[var(--black-300)] min-[558px]:w-4"
              aria-hidden="true"
            />
            <span
              className="absolute h-px w-3 -rotate-45 bg-[var(--black-300)] min-[558px]:w-4"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex w-full flex-col gap-7 min-[558px]:gap-8">
          <div className="flex w-full flex-col gap-3.5 min-[558px]:gap-4">
            <div className="flex items-center gap-2 min-[558px]:gap-3">
              <Chip
                iconSrc="/icons/ic-solid-box.svg"
                label={SERVICE_TYPE_LABEL[serviceType]}
                tone="service"
              />
              {isDesignatedRequest ? (
                <Chip
                  iconSrc="/icons/ic-solid-document.svg"
                  label="지정 견적 요청"
                  tone="designated"
                />
              ) : null}
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col items-start gap-1">
                <MovingBadge />
                <p className="text-lg-semibold whitespace-nowrap text-[#373737] min-[558px]:text-2lg-semibold">
                  {moverName} 기사님
                </p>
              </div>
              <ProfileAvatar
                src={profileSrc}
                alt={`${moverName} 기사님 프로필`}
                isDefault={isDefaultProfile}
              />
            </div>

            <div className="h-px w-full bg-[var(--line-100)]" aria-hidden="true" />

            <div className="flex w-full items-end justify-between gap-3 min-[558px]:justify-start min-[558px]:gap-10">
              <div className="flex items-end gap-3">
                <MoveInfoItem label="출발지" value={departure} />
                <div
                  className="relative h-[23px] w-3 shrink-0 min-[558px]:w-4"
                  aria-hidden="true"
                >
                  <Image
                    src="/icons/arrow-right.svg"
                    alt=""
                    width={16}
                    height={23}
                    className="size-full object-contain"
                    unoptimized
                  />
                </div>
                <MoveInfoItem label="도착지" value={arrival} />
              </div>
              <MoveInfoItem label="이사일" value={formatMoveDate(movedAt)} />
            </div>

            <div className="h-px w-full bg-[var(--line-100)]" aria-hidden="true" />
          </div>

          <FieldSection title="평점을 선택해 주세요">
            <StarRating rating={rating} onChange={onRatingChange} />
          </FieldSection>

          <div className="flex w-full flex-col items-start gap-3">
            <label htmlFor={contentId} className={SECTION_TITLE}>
              상세 후기를 작성해 주세요
            </label>
            <textarea
              id={contentId}
              value={content}
              onChange={(event) => onContentChange(event.target.value)}
              placeholder="최소 10자 이상 입력해주세요"
              rows={5}
              className={cn(
                "h-40 w-full resize-none rounded-2xl border! border-[var(--line-200)]! bg-[var(--gray-50)]!",
                "px-4! py-3.5! text-lg-regular text-[var(--black-400)] placeholder:text-[#ababab]",
                "min-[558px]:px-6! min-[558px]:text-2lg-regular",
                FOCUS_RING,
              )}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={cn(
            "flex h-[54px] w-full items-center justify-center rounded-xl p-4",
            "text-lg-semibold text-[var(--gray-50)]!",
            "min-[558px]:h-16 min-[558px]:rounded-2xl min-[558px]:text-2lg-semibold",
            FOCUS_RING,
            canSubmit
              ? "bg-[var(--primary-400)]!"
              : "cursor-not-allowed bg-[var(--gray-300)]!",
          )}
        >
          {isSubmitting ? "등록 중..." : "리뷰 등록"}
        </button>
      </div>
    </div>
  );
}
