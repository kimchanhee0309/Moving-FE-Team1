import type { AddressChipProps, AddressChipSize } from "./AddressChip.types";

const SIZE_CLASS: Record<AddressChipSize, string> = {
  // Figma chip/address sm: 상하 2px·좌우 6px, 12/20 semibold.
  sm: "px-1.5 py-0.5 text-xs-semibold",
  // Figma chip/address md: 54px 고정 너비, 상하 2px·좌우 4px, 14/24 semibold.
  md: "w-[54px] px-1 py-0.5 text-md-semibold",
  responsive:
    "px-1.5 py-0.5 text-xs-semibold min-[558px]:w-[54px] min-[558px]:px-1 min-[558px]:text-md-semibold",
};

/** 주소 카드에서 도로명·지번 같은 주소 형식을 읽기 전용으로 표시합니다. */
export function AddressChip({
  children,
  size = "responsive",
  isLoading = false,
  className,
  ...spanProps
}: AddressChipProps) {
  return (
    <span
      {...spanProps}
      aria-busy={isLoading || undefined}
      className={[
        "inline-flex shrink-0 items-center justify-center gap-0.5 rounded-2xl",
        "bg-[var(--primary-100)] text-[var(--primary-400)]",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? (
        <span
          className="h-3 w-6 animate-pulse rounded bg-current opacity-15"
          aria-label="주소 형식 불러오는 중"
        />
      ) : (
        children
      )}
    </span>
  );
}
