"use client";

import type { KeyboardEvent } from "react";
import { useRef } from "react";

import type { DropdownOption, DropdownSize } from "./dropdown.types";

interface DropdownOptionListProps {
  id: string;
  options: readonly DropdownOption[];
  selectedValues: readonly string[];
  onSelect: (value: string) => void;
  onClose: () => void;
  ariaLabel: string;
  size?: DropdownSize;
  columns?: 1 | 2;
  hasLeadingDivider?: boolean;
  className?: string;
}

/** 필터와 정렬이 공유하는 목록 UI 및 방향키 순환 탐색을 담당한다. */
export function DropdownOptionList({
  id,
  options,
  selectedValues,
  onSelect,
  onClose,
  ariaLabel,
  size = "sm",
  columns = 1,
  hasLeadingDivider = false,
  className,
}: DropdownOptionListProps) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const isTwoColumn = columns === 2;

  const focusOption = (startIndex: number, direction: 1 | -1) => {
    let nextIndex = startIndex;

    for (let count = 0; count < options.length; count += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;

      if (!options[nextIndex]?.disabled) {
        optionRefs.current[nextIndex]?.focus();
        return;
      }
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index, 1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index, -1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusOption(-1, 1);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusOption(0, -1);
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  const optionButtons = options.map((option, index) => {
    const isSelected = selectedValues.includes(option.value);

    return (
      <button
        aria-selected={isSelected}
        className={[
          "w-full rounded-lg text-left !text-[var(--black-400)] outline-none transition-colors",
          "hover:!bg-[var(--gray-100)] focus-visible:!bg-[var(--gray-100)]",
          "disabled:cursor-not-allowed disabled:!bg-transparent disabled:!text-[var(--gray-400)]",
          isSelected
            ? "!bg-[var(--primary-100)] !text-[var(--primary-400)]"
            : "!bg-[var(--gray-50)]",
          size === "sm"
            ? "text-md-medium min-h-10 !px-3 !py-2"
            : "text-lg-medium min-h-12 !px-4 !py-[11px]",
          !isTwoColumn && hasLeadingDivider && index === 0
            ? "mb-1 rounded-none !border-b !border-[var(--line-200)]"
            : "",
        ].join(" ")}
        disabled={option.disabled}
        key={option.value}
        onClick={() => onSelect(option.value)}
        onKeyDown={(event) => handleKeyDown(event, index)}
        ref={(element) => {
          optionRefs.current[index] = element;
        }}
        role="option"
        type="button"
      >
        {option.label}
      </button>
    );
  });

  return (
    <div
      aria-label={ariaLabel}
      className={[
        "absolute left-0 top-full z-30 mt-2 border border-[var(--line-200)] bg-[var(--gray-50)] p-1.5 shadow-[2px_2px_16px_rgba(0,0,0,0.06)]",
        isTwoColumn ? "" : "flex flex-col",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      id={id}
      role="listbox"
    >
      {isTwoColumn ? (
        <div className="relative">
          <div
            className={[
              "grid grid-cols-2 gap-1 overflow-y-auto overscroll-contain",
              size === "sm" ? "max-h-[216px]" : "max-h-[256px]",
            ].join(" ")}
          >
            {optionButtons}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-px bg-[var(--line-200)]"
          />
        </div>
      ) : (
        optionButtons
      )}
    </div>
  );
}
