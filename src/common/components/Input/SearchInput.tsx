"use client";

import Image from "next/image";
import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";

import type { InputSize } from "./Input";
import { LoadingSpinner } from "./InputParts";

export interface SearchInputProps
  extends Omit<ComponentPropsWithoutRef<"input">, "size" | "type"> {
  /** 화면에는 숨기지만 input과 연결되는 접근성 label입니다. 기본값은 "검색"입니다. */
  label?: string;
  /** Figma의 sm/md variant를 선택하며 기본값은 sm입니다. */
  inputSize?: InputSize;
  /** 검색 요청 중 입력과 지우기를 막고 spinner를 표시합니다. */
  isLoading?: boolean;
  /** controlled value가 있을 때 표시되는 검색어 지우기 버튼의 동작입니다. */
  onClear?: () => void;
  /** 검색 field 최상위 컨테이너의 추가 클래스입니다. */
  containerClassName?: string;
}

// Figma 수치: sm 260×52px/좌우 16px, md 560×64px/좌우 24px.
const CONTAINER_SIZE_CLASS: Record<InputSize, string> = {
  sm: "h-[52px] max-w-[260px] gap-1.5 px-4",
  md: "h-16 max-w-[560px] gap-2 px-6",
};

// sm은 14/24, md는 16/26 typography token을 사용합니다.
const TEXT_SIZE_CLASS: Record<InputSize, string> = {
  sm: "text-md-regular",
  md: "text-lg-regular",
};

// Figma icon instance frame: sm은 24px, md는 36px이며 내부 SVG는 모두 24px입니다.
const ICON_FRAME_SIZE_CLASS: Record<InputSize, string> = {
  sm: "size-6",
  md: "size-9",
};

/**
 * 기사님 검색 등에 재사용하는 Figma input/searchbar 구현입니다.
 * 검색 실행·debounce·서버 상태는 feature가 담당하며 여기서는 입력과 지우기 UI만 제공합니다.
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      id,
      label = "검색",
      inputSize = "sm",
      isLoading = false,
      onClear,
      containerClassName = "",
      className = "",
      value,
      disabled = false,
      "aria-label": ariaLabel,
      ...inputProps
    },
    ref,
  ) {
    // 시각적으로 숨긴 label도 htmlFor로 연결할 수 있도록 안정적인 id를 보장합니다.
    const generatedId = useId();
    const inputId = id ?? generatedId;

    // loading은 진행 중인 검색 조건이 바뀌지 않도록 native disabled 상태보다 우선합니다.
    const isDisabled = disabled || isLoading;

    // 지우기 버튼은 controlled value와 onClear가 모두 있을 때만 노출합니다.
    const hasValue = value !== undefined && String(value).length > 0;

    return (
      <div
        aria-busy={isLoading || undefined}
        className={`flex w-full items-center rounded-2xl bg-[var(--background-100)] transition-colors hover:bg-[var(--background-200)] focus-within:bg-[var(--background-200)] focus-within:ring-1 focus-within:ring-[var(--primary-400)] ${CONTAINER_SIZE_CLASS[inputSize]} ${
          isDisabled ? "cursor-not-allowed opacity-60" : ""
        } ${containerClassName}`}
      >
        <label className="sr-only" htmlFor={inputId}>
          {label}
        </label>
        {/* 의미는 연결된 label이 전달하므로 검색 아이콘 자체는 장식 이미지로 처리합니다. */}
        <span
          aria-hidden="true"
          className={`flex shrink-0 items-center justify-center ${ICON_FRAME_SIZE_CLASS[inputSize]}`}
        >
          <Image src="/icons/input/search.svg" alt="" width={24} height={24} unoptimized />
        </span>
        <input
          {...inputProps}
          ref={ref}
          id={inputId}
          type="search"
          value={value}
          disabled={isDisabled}
          aria-label={ariaLabel}
          className={`${TEXT_SIZE_CLASS[inputSize]} min-w-0 flex-1 appearance-none bg-transparent text-[var(--black-400)] outline-none placeholder:text-[var(--gray-300)] disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:appearance-none ${className}`}
        />
        {/* 검색 중에는 중복 조작을 막는 spinner가 지우기 버튼보다 우선합니다. */}
        {isLoading ? (
          <LoadingSpinner />
        ) : hasValue && onClear ? (
          <button
            type="button"
            aria-label="검색어 지우기"
            className={`flex shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] ${ICON_FRAME_SIZE_CLASS[inputSize]}`}
            onClick={onClear}
          >
            <Image src="/icons/input/clear.svg" alt="" width={24} height={24} unoptimized />
          </button>
        ) : null}
      </div>
    );
  },
);
