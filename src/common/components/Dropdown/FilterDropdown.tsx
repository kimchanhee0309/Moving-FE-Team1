"use client";

import type { KeyboardEvent } from "react";

import { ChevronDownIcon, ChevronUpIcon, LoadingSpinner } from "./DropdownIcons";
import { DropdownOptionList } from "./DropdownOptionList";
import type { DropdownOption, DropdownSize } from "./dropdown.types";
import { useDropdown } from "./useDropdown";

const FILTER_ALL_VALUE = "__filter-all__";

export interface FilterDropdownChangeMeta {
  isAllSelected: boolean;
}

export interface FilterDropdownProps {
  label: string;
  options: readonly DropdownOption[];
  values: readonly string[];
  isAllSelected?: boolean;
  onChange: (values: string[], meta: FilterDropdownChangeMeta) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectionMode?: "single" | "multiple";
  layout?: "one-line" | "two-column";
  size?: DropdownSize;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
}

/**
 * Figma `Drop_down_필터`의 sm/md, 1열/2열 형태를 제공한다.
 * 선택값과 열림 상태는 목록 페이지가 소유해 URL 검색 조건과 동기화할 수 있다.
 */
export function FilterDropdown({
  label,
  options,
  values,
  isAllSelected = false,
  onChange,
  isOpen,
  onOpenChange,
  selectionMode = "multiple",
  layout = "one-line",
  size = "sm",
  disabled = false,
  isLoading = false,
  error,
  showAllOption = true,
  allOptionLabel = "전체",
  className,
}: FilterDropdownProps) {
  const isDisabled = disabled || isLoading;
  const hasAllSelection = showAllOption && isAllSelected;
  const isActive = isOpen || hasAllSelection || values.length > 0;
  const { closeAndRestoreFocus, menuId, rootRef, toggle, triggerRef } =
    useDropdown({ isOpen, onOpenChange, disabled: isDisabled });
  const errorId = `${menuId}-error`;
  const displayedOptions: readonly DropdownOption[] = showAllOption
    ? [{ value: FILTER_ALL_VALUE, label: allOptionLabel }, ...options]
    : options;
  const selectedOptionLabels = options
    .filter((option) => values.includes(option.value))
    .map((option) => option.label);
  const displayedLabel = hasAllSelection
    ? allOptionLabel
    : selectedOptionLabels.length > 1
      ? `${selectedOptionLabels[0]} 외 ${selectedOptionLabels.length - 1}개`
      : (selectedOptionLabels[0] ?? label);

  const handleSelect = (value: string) => {
    if (value === FILTER_ALL_VALUE) {
      onChange([], { isAllSelected: true });
      closeAndRestoreFocus();
      return;
    }

    if (selectionMode === "single") {
      onChange([value], { isAllSelected: false });
      closeAndRestoreFocus();
      return;
    }

    onChange(
      values.includes(value)
        ? values.filter((selectedValue) => selectedValue !== value)
        : [...values, value],
      { isAllSelected: false },
    );
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
      className={["relative inline-flex flex-col", className]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <button
        aria-controls={menuId}
        aria-describedby={error ? errorId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={[
          "inline-flex items-center justify-between !border !bg-[var(--gray-50)] !text-[var(--black-400)] outline-none transition-colors",
          "hover:!border-[var(--gray-400)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-300)]",
          "disabled:cursor-not-allowed disabled:!border-[var(--gray-200)] disabled:!bg-[var(--gray-100)] disabled:!text-[var(--gray-400)]",
          size === "sm"
            ? "text-md-medium h-9 gap-1.5 rounded-lg !py-1.5 !pl-3.5 !pr-2.5"
            : "text-lg-medium h-[50px] min-w-40 gap-3 rounded-xl !py-3 !pl-5 !pr-3",
          isActive
            ? "!border-[var(--primary-400)] !bg-[var(--primary-100)] !text-[var(--primary-400)]"
            : "!border-[var(--line-200)]",
          error ? "!border-[var(--primary-400)]" : "",
        ].join(" ")}
        disabled={isDisabled}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <span className="max-w-40 truncate whitespace-nowrap">
          {displayedLabel}
        </span>
        {isLoading ? (
          <LoadingSpinner className={size === "sm" ? "size-4" : "size-5"} />
        ) : isOpen ? (
          <ChevronUpIcon className={size === "sm" ? "size-5" : "size-9"} />
        ) : (
          <ChevronDownIcon className={size === "sm" ? "size-5" : "size-9"} />
        )}
      </button>

      {isOpen && !isDisabled ? (
        <DropdownOptionList
          ariaLabel={`${label} 필터 옵션`}
          className={[
            "rounded-2xl",
            layout === "two-column"
              ? size === "sm"
                ? "w-[236px]"
                : "w-72"
              : size === "sm"
                ? "min-w-[140px]"
                : "min-w-40",
          ].join(" ")}
          columns={layout === "two-column" ? 2 : 1}
          hasLeadingDivider={showAllOption}
          id={menuId}
          onClose={closeAndRestoreFocus}
          onSelect={handleSelect}
          options={displayedOptions}
          selectedValues={hasAllSelection ? [FILTER_ALL_VALUE] : values}
          size={size}
        />
      ) : null}

      {error ? (
        <p className="text-xs-regular mt-1 text-[var(--primary-400)]" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
