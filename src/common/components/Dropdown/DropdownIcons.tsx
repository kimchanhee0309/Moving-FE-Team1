interface IconProps {
  className?: string;
}

export function ChevronDownIcon({ className }: IconProps) {
  return <MaskIcon className={className} src="/icons/dropdown/ic-chevron-down.svg" />;
}

export function ChevronUpIcon({ className }: IconProps) {
  return <MaskIcon className={className} src="/icons/dropdown/ic-chevron-up.svg" />;
}

export function SortChevronDownIcon({ className }: IconProps) {
  return (
    <MaskIcon
      className={className}
      src="/icons/dropdown/ic-sort-chevron-down.svg"
    />
  );
}

export function SortChevronUpIcon({ className }: IconProps) {
  return (
    <MaskIcon
      className={className}
      src="/icons/dropdown/ic-sort-chevron-up.svg"
    />
  );
}

export function CalendarIcon({ className }: IconProps) {
  return <MaskIcon className={className} src="/icons/dropdown/ic-calendar.svg" />;
}

export function CloseIcon({ className }: IconProps) {
  return <MaskIcon className={className} src="/icons/dropdown/ic-close.svg" />;
}

export function LoadingSpinner({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        "inline-block animate-spin rounded-full border-2 border-current border-r-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

interface MaskIconProps extends IconProps {
  src: string;
}

/** public 아이콘 파일을 사용하면서 Dropdown 상태의 currentColor를 그대로 반영한다. */
function MaskIcon({ className, src }: MaskIconProps) {
  return (
    <span
      aria-hidden="true"
      className={["inline-block shrink-0 bg-current", className]
        .filter(Boolean)
        .join(" ")}
      style={{
        WebkitMaskImage: `url("${src}")`,
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskImage: `url("${src}")`,
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
      }}
    />
  );
}
