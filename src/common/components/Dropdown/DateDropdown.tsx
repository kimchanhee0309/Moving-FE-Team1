"use client";

import type { ReactNode } from "react";

import { CalendarIcon, ChevronDownIcon, LoadingSpinner } from "./DropdownIcons";
import { useDropdown } from "./useDropdown";

export interface DateDropdownProps {
  valueLabel: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  panel?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

/**
 * Figma의 `Dropdown2`에 해당하는 날짜 선택 트리거다.
 * 캘린더 본체는 페이지에서 선택한 라이브러리를 `panel`로 주입한다.
 */
export function DateDropdown({
  valueLabel,
  isOpen,
  onOpenChange,
  panel,
  ariaLabel = "이사 날짜 선택",
  disabled = false,
  isLoading = false,
  error,
  className,
}: DateDropdownProps) {
  const isDisabled = disabled || isLoading;
  const { menuId, rootRef, toggle, triggerRef } = useDropdown({
    isOpen,
    onOpenChange,
    disabled: isDisabled,
  });
  const errorId = `${menuId}-error`;

  return (
    <div
      className={["relative flex w-full max-w-[520px] flex-col", className]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <button
        aria-controls={panel ? menuId : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        className={[
          "text-lg-medium flex h-[50px] w-full items-center gap-3 rounded-xl !border !bg-[var(--gray-50)] !py-3 !pl-5 !pr-3 text-left !text-[var(--black-400)] outline-none transition-colors",
          "hover:!border-[var(--gray-400)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-300)]",
          "disabled:cursor-not-allowed disabled:!border-[var(--gray-200)] disabled:!bg-[var(--gray-100)] disabled:!text-[var(--gray-400)]",
          isOpen
            ? "!border-2 !border-[var(--primary-400)]"
            : "!border-[var(--gray-300)]",
          error ? "!border-2 !border-[var(--primary-400)]" : "",
        ].join(" ")}
        disabled={isDisabled}
        onClick={toggle}
        ref={triggerRef}
        type="button"
      >
        <CalendarIcon className="size-6 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{valueLabel}</span>
        {isLoading ? (
          <LoadingSpinner className="size-5 shrink-0" />
        ) : (
          <ChevronDownIcon className="size-9 shrink-0" />
        )}
      </button>

      {isOpen && panel ? (
        <div
          className="absolute left-0 top-full z-30 mt-2"
          id={menuId}
          role="dialog"
        >
          {panel}
        </div>
      ) : null}

      {error ? (
        <p className="text-xs-regular mt-1 text-[var(--primary-400)]" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
