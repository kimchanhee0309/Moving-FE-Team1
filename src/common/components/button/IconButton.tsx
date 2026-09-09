"use client";

import Image from "next/image";
import type { ComponentPropsWithRef } from "react";

export type IconButtonKind = "like" | "clip" | "kakao" | "facebook";
export type IconButtonSize = "xs" | "sm" | "md";

/** Figma에 없는 like/xs 조합은 허용하지 않습니다. 크기는 xs=40, sm=54, md=64px입니다. */
export type IconButtonProps = Omit<ComponentPropsWithRef<"button">, "children" | "aria-label"> & {
  /** 아이콘만 표시하므로 동작을 설명하는 한국어 이름을 필수로 전달합니다. */
  "aria-label": string;
  /** 호출부에서 제어하며 로딩 중에는 disabled와 aria-busy가 함께 적용됩니다. */
  isLoading?: boolean;
} & (
  | { kind: "like"; size?: "sm" | "md" }
  | { kind: Exclude<IconButtonKind, "like">; size?: IconButtonSize }
);

const KIND_CLASS: Record<IconButtonKind, string> = {
  like: "border-[var(--line-200)] bg-[var(--gray-50)] text-[var(--black-500)]",
  clip: "border-[var(--line-200)] bg-[var(--gray-50)] text-[var(--black-500)]",
  kakao: "bg-[#fae100] text-[var(--black-500)]",
  facebook: "bg-[var(--primary-400)] text-[var(--gray-50)]",
};
const SIZE_CLASS: Record<IconButtonSize, string> = {
  xs: "size-10 rounded-lg",
  sm: "size-[54px] rounded-2xl",
  md: "size-16 rounded-2xl",
};
const ASSETS: Record<IconButtonKind, Record<IconButtonSize, string>> = {
  like: { xs: "like-sm", sm: "like-sm", md: "like-md" },
  clip: { xs: "clip-sm", sm: "clip-sm", md: "clip-md" },
  kakao: { xs: "kakao", sm: "kakao", md: "kakao" },
  facebook: { xs: "facebook-sm", sm: "facebook-sm", md: "facebook-md" },
};

/**
 * Figma etc의 아이콘 버튼입니다. 복사·공유 SDK·찜 API는 실행하지 않고 onClick을 전달합니다.
 * 필요하면 호출부에서 aria-pressed로 토글 상태를 알려주며 이 컴포넌트는 상태를 소유하지 않습니다.
 */
export function IconButton({
  kind,
  size = "sm",
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  "aria-busy": ariaBusy,
  ...buttonProps
}: IconButtonProps) {
  // Figma 1:1794~1:1813: md의 찜/링크는 36px, 공유 로고는 28px입니다.
  const iconSize = size === "md" ? (kind === "like" || kind === "clip" ? 36 : 28) : 24;

  return (
    <button
      {...buttonProps}
      type={type}
      className={`box-border inline-flex shrink-0 cursor-pointer items-center justify-center border border-transparent font-[inherit] transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:opacity-50 disabled:aria-busy:cursor-wait motion-reduce:transition-none ${SIZE_CLASS[size]} ${KIND_CLASS[kind]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || ariaBusy}
    >
      {isLoading ? <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" aria-hidden="true" /> : (
        <Image src={`/icons/button/${ASSETS[kind][size]}.svg`} alt="" width={iconSize} height={iconSize} />
      )}
    </button>
  );
}
