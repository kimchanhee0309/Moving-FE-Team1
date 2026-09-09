import type { ProfileSelectionChipSize } from "./ProfileSelectionChip.types";

const SIZE_CLASS: Record<ProfileSelectionChipSize, string> = {
  // Figma chip/지역 sm: 콘텐츠 14/24, 상하 6px·좌우 12px.
  sm: "px-3 py-[5px] text-md-medium",
  // 프로필 폼은 744px 태블릿에서도 sm을 유지하고 1200px 데스크톱에서만 md로 전환합니다.
  md: "px-3 py-[5px] text-md-medium min-[1200px]:px-5 min-[1200px]:py-[9px] min-[1200px]:!text-[16px] min-[1200px]:!leading-[26px] min-[1200px]:!font-medium",
};

interface ProfileSelectionChipClassNameOptions {
  size: ProfileSelectionChipSize;
  isSelected: boolean;
  isInvalid: boolean;
  className?: string;
  focusClassName?: string;
}

/** button Chip과 native radio Chip이 동일한 Figma 상태 스타일을 공유하게 합니다. */
export function getProfileSelectionChipClassName({
  size,
  isSelected,
  isInvalid,
  className,
  focusClassName =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)]",
}: ProfileSelectionChipClassNameOptions): string {
  return [
    "inline-flex items-center justify-center gap-2.5 rounded-full border transition-colors",
    focusClassName,
    "disabled:cursor-not-allowed disabled:opacity-50",
    SIZE_CLASS[size],
    isSelected
      ? "border-[var(--primary-400)] bg-[var(--primary-100)] text-[var(--primary-400)] hover:bg-[var(--primary-200)]"
      : "border-[var(--gray-300)] bg-[var(--background-100)] text-[var(--black-400)] hover:bg-[var(--background-200)]",
    isInvalid && !isSelected
      ? "border-[var(--secondary-red-200)]"
      : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
