"use client";

import type { ChangeEvent } from "react";

import { getProfileSelectionChipClassName } from "./ProfileSelectionChip.styles";
import type { ProfileSingleSelectChipGroupProps } from "./ProfileSelectionChip.types";

/**
 * 일반 유저의 거주 지역처럼 반드시 한 항목만 선택해야 하는 Chip 그룹입니다.
 * native radio의 같은 name 계약을 사용해 클릭뿐 아니라 방향키 선택도 브라우저 기본 동작으로 지원합니다.
 */
export function ProfileSingleSelectChipGroup<T extends string>({
  name,
  options,
  value,
  onValueChange,
  size = "sm",
  disabled = false,
  isLoading = false,
  isInvalid = false,
  required = false,
  className,
  ariaLabel,
  ariaDescribedBy,
}: ProfileSingleSelectChipGroupProps<T>) {
  const isInteractionDisabled = disabled || isLoading;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedOption = options.find(
      (option) => option.value === event.currentTarget.value,
    );

    if (selectedOption) {
      onValueChange(selectedOption.value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-invalid={isInvalid || undefined}
      aria-busy={isLoading || undefined}
      className={["flex w-full flex-wrap gap-3", className]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const isOptionDisabled = isInteractionDisabled || option.disabled;

        return (
          <label
            key={option.value}
            className={isOptionDisabled ? "cursor-not-allowed" : "cursor-pointer"}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              required={required}
              disabled={isOptionDisabled}
              className="peer sr-only"
              onChange={handleChange}
            />
            <span
              className={getProfileSelectionChipClassName({
                size,
                isSelected,
                isInvalid,
                focusClassName:
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--primary-400)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              })}
            >
              {isLoading ? (
                <span
                  className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
              ) : null}
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
