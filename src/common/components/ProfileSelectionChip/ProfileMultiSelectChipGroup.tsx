"use client";

import { ProfileSelectionChip } from "./ProfileSelectionChip";
import type { ProfileMultiSelectChipGroupProps } from "./ProfileSelectionChip.types";

/**
 * 프로필의 제공 서비스·서비스 가능 지역을 여러 개 선택하는 controlled 그룹입니다.
 * 선택 개수 제한과 서버 DTO 변환은 feature가 소유하고, 이 컴포넌트는 접근 가능한 토글 묶음만 제공합니다.
 */
export function ProfileMultiSelectChipGroup<T extends string>({
  options,
  values,
  onValuesChange,
  size = "sm",
  disabled = false,
  isLoading = false,
  isInvalid = false,
  className,
  ariaLabel,
  ariaDescribedBy,
}: ProfileMultiSelectChipGroupProps<T>) {
  const selectedValues = new Set(values);

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={isLoading || undefined}
      data-invalid={isInvalid || undefined}
      className={["flex w-full flex-wrap gap-2", className].filter(Boolean).join(" ")}
    >
      {options.map((option) => {
        const isSelected = selectedValues.has(option.value);

        return (
          <ProfileSelectionChip
            key={option.value}
            isSelected={isSelected}
            size={size}
            isLoading={isLoading}
            isInvalid={isInvalid}
            disabled={disabled || option.disabled}
            onSelectedChange={(nextSelected) => {
              onValuesChange(
                nextSelected
                  ? [...values, option.value]
                  : values.filter((value) => value !== option.value),
              );
            }}
          >
            {option.label}
          </ProfileSelectionChip>
        );
      })}
    </div>
  );
}
