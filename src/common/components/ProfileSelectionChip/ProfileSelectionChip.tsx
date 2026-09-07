"use client";

import type { MouseEvent } from "react";

import type {
  ProfileSelectionChipProps,
} from "./ProfileSelectionChip.types";
import { getProfileSelectionChipClassName } from "./ProfileSelectionChip.styles";

/**
 * 프로필 등록·수정에서 서비스와 지역을 토글하는 공통 Chip입니다.
 * 선택 데이터와 최대 선택 개수 같은 비즈니스 규칙은 소유하지 않고 controlled callback만 제공합니다.
 */
export function ProfileSelectionChip({
  children,
  isSelected,
  size = "sm",
  isLoading = false,
  isInvalid = false,
  disabled = false,
  className,
  onClick,
  onSelectedChange,
  ...buttonProps
}: ProfileSelectionChipProps) {
  // loading은 disabled보다 우선해 중복 입력을 막되, 기존 선택 여부는 유지해 레이아웃 점프를 방지합니다.
  const isInteractionDisabled = disabled || isLoading;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented) {
      onSelectedChange?.(!isSelected);
    }
  };

  return (
    <button
      {...buttonProps}
      type="button"
      aria-pressed={isSelected}
      aria-busy={isLoading || undefined}
      data-invalid={isInvalid || undefined}
      disabled={isInteractionDisabled}
      className={getProfileSelectionChipClassName({
        size,
        isSelected,
        isInvalid,
        className,
      })}
      onClick={handleClick}
    >
      {isLoading ? (
        <span
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
