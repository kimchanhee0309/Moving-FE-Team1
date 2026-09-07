"use client";

import Image from "next/image";

import type { PaginationProps, PaginationSize } from "./Pagination.types";

type PageItem = number | "ellipsis-left" | "ellipsis-right";

const BUTTON_SIZE_CLASS: Record<PaginationSize, string> = {
  sm: "size-[34px] rounded-md text-md-medium",
  lg: "size-[34px] rounded-md text-md-medium min-[744px]:size-12 min-[744px]:rounded-lg min-[744px]:text-lg-medium",
};

const ICON_SIZE_CLASS: Record<PaginationSize, string> = {
  sm: "size-3.5",
  lg: "size-3.5 min-[744px]:size-6",
};

const MAX_PAGE_ITEM_COUNT: Record<PaginationSize, number> = {
  // Figma sm: 1, 2, 3, …, 마지막 페이지.
  sm: 5,
  // Figma lg: 1, 2, 3, 4, 5, …, 마지막 페이지.
  lg: 7,
};

function createPageRange(startPage: number, count: number): number[] {
  return Array.from({ length: count }, (_, index) => startPage + index);
}

/**
 * Figma 규격에 맞춰 첫·끝 페이지를 유지하고 크기별 표시 개수를 제한합니다.
 * 중간 페이지에서는 현재 페이지 주변 숫자를 남기고 생략된 양쪽 구간을 각각 표시합니다.
 */
function createPageItems(
  currentPage: number,
  totalPages: number,
  maxItemCount: number,
): PageItem[] {
  if (totalPages <= maxItemCount) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const edgePageCount = maxItemCount - 2;

  if (currentPage <= edgePageCount) {
    return [
      ...createPageRange(1, edgePageCount),
      "ellipsis-right",
      totalPages,
    ];
  }

  if (currentPage >= totalPages - edgePageCount + 1) {
    return [
      1,
      "ellipsis-left",
      ...createPageRange(totalPages - edgePageCount + 1, edgePageCount),
    ];
  }

  const middlePageCount = maxItemCount - 4;
  const middleStartPage = currentPage - Math.floor(middlePageCount / 2);

  return [
    1,
    "ellipsis-left",
    ...createPageRange(middleStartPage, middlePageCount),
    "ellipsis-right",
    totalPages,
  ];
}

/**
 * 리뷰처럼 페이지 단위로 조회하는 목록에서 사용하는 controlled 페이지네이션입니다.
 * URL 변경이나 서버 요청은 소유하지 않고 선택된 페이지 번호만 호출부에 전달합니다.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  size = "sm",
  isLoading = false,
  disabled = false,
  className,
  ariaLabel = "페이지 이동",
}: PaginationProps) {
  const normalizedTotalPages = Math.max(0, Math.trunc(totalPages));

  if (normalizedTotalPages <= 0) {
    return null;
  }

  const safeCurrentPage = Math.min(
    Math.max(Math.trunc(currentPage), 1),
    normalizedTotalPages,
  );
  const pageItems = createPageItems(
    safeCurrentPage,
    normalizedTotalPages,
    MAX_PAGE_ITEM_COUNT[size],
  );
  const isInteractionDisabled = disabled || isLoading;
  const buttonClassName = [
    "inline-flex shrink-0 items-center justify-center bg-[var(--gray-50)] text-[var(--black-400)] transition-colors",
    "hover:bg-[var(--gray-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)]",
    "disabled:cursor-not-allowed disabled:text-[var(--gray-300)] disabled:opacity-40 disabled:hover:bg-[var(--gray-50)]",
    BUTTON_SIZE_CLASS[size],
  ].join(" ");

  return (
    <nav
      aria-label={ariaLabel}
      aria-busy={isLoading || undefined}
      className={["flex items-center gap-2", className].filter(Boolean).join(" ")}
    >
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={isInteractionDisabled || safeCurrentPage === 1}
        className={buttonClassName}
        onClick={() => onPageChange(safeCurrentPage - 1)}
      >
        <Image
          src="/icons/common-chip-mypage/chevron-left.svg"
          alt=""
          width={24}
          height={24}
          className={ICON_SIZE_CLASS[size]}
          aria-hidden="true"
        />
      </button>

      {pageItems.map((item) => {
        if (typeof item !== "number") {
          return (
            <span
              key={item}
              className={`${buttonClassName} text-[var(--gray-400)]`}
              aria-hidden="true"
            >
              ···
            </span>
          );
        }

        const isCurrentPage = item === safeCurrentPage;

        return (
          <button
            key={item}
            type="button"
            aria-label={`${item}페이지`}
            aria-current={isCurrentPage ? "page" : undefined}
            disabled={isInteractionDisabled}
            className={`${buttonClassName} ${
              isCurrentPage
                ? "font-bold text-[var(--black-500)]"
                : "text-[var(--gray-300)]"
            }`}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="다음 페이지"
        disabled={isInteractionDisabled || safeCurrentPage === normalizedTotalPages}
        className={buttonClassName}
        onClick={() => onPageChange(safeCurrentPage + 1)}
      >
        <Image
          src="/icons/common-chip-mypage/chevron-right.svg"
          alt=""
          width={24}
          height={24}
          className={ICON_SIZE_CLASS[size]}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}
