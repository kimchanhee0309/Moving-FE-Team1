"use client";

import Image from "next/image";
import type { ComponentPropsWithRef, ReactNode } from "react";

export type ButtonSize = "sm" | "md";
export type ButtonVariant = "solid" | "outlined";

/** Native button/ref를 지원하며 상태는 호출부에서 관리합니다. */
export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  /** Figma CTA: sm=54px, md=60px. 기본값 sm. */
  size?: ButtonSize;
  /** 기본값 solid. hover는 CSS, 비활성 상태는 disabled로 제어합니다. */
  variant?: ButtonVariant;
  /** 기본 너비(sm 327px/md 640px) 대신 부모 너비를 채웁니다. */
  fullWidth?: boolean;
  /** disabled와 함께 전달되면 로딩 표시가 우선하며 클릭을 차단합니다. */
  isLoading?: boolean;
  /** 텍스트와 별개인 장식용 아이콘. 상호작용 요소를 넣지 않습니다. */
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Figma solid-icon의 글쓰기 아이콘. trailingIcon이 있으면 해당 아이콘이 우선합니다. */
  withWritingIcon?: boolean;
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "min-h-[54px] gap-1 rounded-xl px-4 py-3 text-lg-semibold",
  md: "min-h-[60px] gap-2 rounded-2xl p-4 text-2lg-semibold",
};
const WIDTH_CLASS: Record<ButtonSize, string> = {
  sm: "w-[327px]",
  md: "w-[640px]",
};
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  // hover/disabled의 값은 Figma Button(1:1695)에만 존재해 Tailwind arbitrary value로 이 컴포넌트에 한정합니다.
  solid:
    "border-transparent bg-[var(--primary-400)] text-[var(--gray-50)] enabled:hover:bg-[#e04829] disabled:bg-[var(--gray-300)]",
  outlined:
    "border-[#c4c4c4] bg-transparent text-[var(--content-muted)] shadow-[4px_4px_10px_rgb(195_217_242_/_20%)] enabled:hover:bg-[var(--gray-100)] disabled:border-[var(--gray-200)] disabled:text-[var(--gray-400)]",
};

const BASE_CLASS =
  "box-border inline-flex max-w-full shrink-0 cursor-pointer items-center justify-center border font-[inherit] transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-3 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:aria-busy:cursor-wait motion-reduce:transition-none";

/** CTA의 표현과 native 버튼 동작만 담당합니다. 요청·라우팅·로딩 종료는 호출부 책임입니다. */
export function Button({
  children,
  className = "",
  size = "sm",
  variant = "solid",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leadingIcon,
  trailingIcon,
  withWritingIcon = false,
  type = "button",
  "aria-busy": ariaBusy,
  ...buttonProps
}: ButtonProps) {
  const endIcon = trailingIcon ?? (withWritingIcon ? (
    <Image src="/icons/button/writing.svg" alt="" width={24} height={24} />
  ) : null);

  return (
    <button
      {...buttonProps}
      type={type}
      className={`${BASE_CLASS} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${fullWidth ? "w-full" : WIDTH_CLASS[size]} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || ariaBusy}
    >
      {/* 로딩이 장식 아이콘보다 우선하고, 원래 문구는 접근 가능한 이름으로 유지합니다. */}
      {isLoading ? <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" aria-hidden="true" /> : leadingIcon && (
        <span className="flex size-6 shrink-0 items-center justify-center [&>*]:size-6" aria-hidden="true">{leadingIcon}</span>
      )}
      <span className="min-w-0 [overflow-wrap:anywhere]">{children}</span>
      {!isLoading && endIcon && <span className="flex size-6 shrink-0 items-center justify-center [&>*]:size-6" aria-hidden="true">{endIcon}</span>}
    </button>
  );
}
