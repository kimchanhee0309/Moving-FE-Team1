"use client";

import type { KeyboardEvent } from "react";

import {
  LoadingSpinner,
  SortChevronDownIcon,
  SortChevronUpIcon,
} from "./DropdownIcons";
import { DropdownOptionList } from "./DropdownOptionList";
import type { DropdownOption, DropdownSize } from "./dropdown.types";
import { useDropdown } from "./useDropdown";

export interface SortDropdownProps {
  options: readonly DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  size?: DropdownSize;
  disabled?: boolean;
  isLoading?: boolean;
  ariaLabel?: string;
  className?: string;
}

/**
 * Figma `Sort`를 목록 페이지에서 재사용하기 위한 단일 선택 컴포넌트다.
 * 정렬 기준의 실제 API query 값은 options의 value로 호출부가 결정한다.
 */
export function SortDropdown({
  options,
  value,
  onChange,
  isOpen,
  onOpenChange,
  size = "sm",
  disabled = false,
  isLoading = false,
  ariaLabel = "정렬 기준 선택",
  className,
}: SortDropdownProps) {
  const isDisabled = disabled || isLoading;
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? value;
  const { closeAndRestoreFocus, menuId, rootRef, toggle, triggerRef } =
    useDropdown({ isOpen, onOpenChange, disabled: isDisabled });

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    closeAndRestoreFocus();
  };

  const handleTriggerKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onOpenChange(true);
      requestAnimationFrame(() => {
        rootRef.current
          ?.querySelector<HTMLButtonElement>('button[role="option"]:not(:disabled)')
          ?.focus();
      });
    }
  };

  return (
    <div
      className={["relative inline-flex", className].filter(Boolean).join(" ")}
      ref={rootRef}
    >
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className={[
          "inline-flex items-center justify-between rounded-lg !bg-[var(--gray-50)] !text-[var(--black-400)] outline-none transition-colors",
          "hover:!bg-[var(--gray-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-300)]",
          "disabled:cursor-not-allowed disabled:!bg-[var(--gray-100)] disabled:!text-[var(--gray-400)]",
          size === "sm"
            ? "text-xs-semibold min-h-8 gap-0.5 !py-1.5 !pl-2 !pr-1.5"
            : "text-md-semibold h-10 min-w-[114px] gap-2.5 !px-2.5 !py-2 shadow-[4px_4px_10px_rgba(220,220,220,0.2)]",
        ].join(" ")}
        disabled={isDisabled}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span className="whitespace-nowrap">{selectedLabel}</span>
        {isLoading ? (
          <LoadingSpinner className="size-4" />
        ) : isOpen ? (
          <SortChevronUpIcon className="size-5 shrink-0 text-[var(--gray-200)]" />
        ) : (
          <SortChevronDownIcon className="size-5 shrink-0 text-[var(--gray-200)]" />
        )}
      </button>

      {isOpen && !isDisabled ? (
        <DropdownOptionList
          ariaLabel={ariaLabel}
          className="min-w-full whitespace-nowrap rounded-lg"
          id={menuId}
          onClose={closeAndRestoreFocus}
          onSelect={handleSelect}
          options={options}
          selectedValues={[value]}
          size={size}
        />
      ) : null}
    </div>
  );
}
