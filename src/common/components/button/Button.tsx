"use client";

import Image from "next/image";
import type { ComponentPropsWithRef, ReactNode } from "react";

import styles from "./Button.module.css";

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
  sm: `${styles.sm} text-lg-semibold`,
  md: `${styles.md} text-2lg-semibold`,
};
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  solid: styles.solid,
  outlined: styles.outlined,
};

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
      className={`${styles.base} ${styles.cta} ${SIZE_CLASS[size]} ${VARIANT_CLASS[variant]} ${fullWidth ? styles.fullWidth : ""} ${className}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading || ariaBusy}
    >
      {/* 로딩이 장식 아이콘보다 우선하고, 원래 문구는 접근 가능한 이름으로 유지합니다. */}
      {isLoading ? <span className={styles.spinner} aria-hidden="true" /> : leadingIcon && (
        <span className={styles.icon} aria-hidden="true">{leadingIcon}</span>
      )}
      <span className={styles.label}>{children}</span>
      {!isLoading && endIcon && <span className={styles.icon} aria-hidden="true">{endIcon}</span>}
    </button>
  );
}
