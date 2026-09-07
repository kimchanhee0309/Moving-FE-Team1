"use client";

import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";

import type { InputSize } from "./Input";
import {
  buildDescribedBy,
  FIELD_CONTAINER_CLASS,
  FieldLabel,
  FieldMessage,
  getFieldStateClass,
  LoadingSpinner,
} from "./InputParts";
import type { AccessibleFieldLabelProps } from "./Input.types";

interface TextareaOwnProps {
  /** Figma의 sm/md variant를 선택하며 기본값은 sm입니다. */
  inputSize?: InputSize;
  /** 값이 있으면 오류 테두리·문구·aria-invalid를 함께 활성화합니다. */
  error?: string;
  /** 오류가 아닐 때 노출하는 입력 조건·길이 등의 도움말입니다. */
  helperText?: string;
  /** 내용을 불러오거나 저장하는 동안 textarea를 disabled 처리하고 spinner를 표시합니다. */
  isLoading?: boolean;
  /** label, field, message를 감싸는 최상위 컨테이너의 추가 클래스입니다. */
  containerClassName?: string;
}

/**
 * Figma input/text_area의 공개 계약입니다.
 * native textarea props를 확장하므로 value/onChange와 defaultValue 방식을 모두 지원합니다.
 * label이 없으면 aria-label을 필수로 요구하며, 오류는 안내 문구인 error로만 활성화합니다.
 */
export type TextareaProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "aria-label"
> &
  AccessibleFieldLabelProps &
  TextareaOwnProps;

// Figma 수치: 두 variant 모두 높이는 160px이고 너비만 sm 327px, md 560px로 달라집니다.
const CONTAINER_SIZE_CLASS: Record<InputSize, string> = {
  sm: "max-w-[327px]",
  md: "max-w-[560px]",
};

// Figma 수치: 상하 14px, 좌우는 sm 16px·md 24px입니다.
const TEXTAREA_SIZE_CLASS: Record<InputSize, string> = {
  sm: "px-4 py-[14px]",
  md: "px-6 py-[14px]",
};

// spinner도 Figma의 좌우 padding 안쪽에 정렬되도록 size별 위치를 분리합니다.
const SPINNER_POSITION_CLASS: Record<InputSize, string> = {
  sm: "right-4 top-[14px]",
  md: "right-6 top-[14px]",
};

/**
 * 한 줄 소개와 상세 설명에 사용하는 공통 여러 줄 입력 컴포넌트입니다.
 * 글자 수 검증이나 서버 저장은 feature form이 담당하고 여기서는 상태 표현만 담당합니다.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      id,
      label,
      inputSize = "sm",
      error,
      helperText,
      isLoading = false,
      containerClassName = "",
      className = "",
      disabled = false,
      required = false,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
      ...textareaProps
    },
    ref,
  ) {
    // id를 생략한 사용처에서도 label과 도움말 연결이 끊기지 않도록 고유 id를 생성합니다.
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const messageId = `${textareaId}-message`;

    // 오류 문구가 있을 때만 테두리와 aria-invalid를 함께 활성화해 색상만 있는 오류를 방지합니다.
    const hasError = Boolean(error);
    // 오류와 도움말이 동시에 있으면 수정이 필요한 오류 메시지를 우선 노출합니다.
    const message = error ?? helperText;
    // loading 동안 입력값이 바뀌지 않도록 실제 textarea의 disabled 속성까지 적용합니다.
    const isDisabled = disabled || isLoading;

    // 외부 aria-describedby를 덮어쓰지 않고 내부 메시지 id와 함께 연결합니다.
    const describedBy = buildDescribedBy(ariaDescribedBy, message ? messageId : undefined);
    const fieldStateClass = getFieldStateClass(hasError);

    return (
      <div
        className={`${FIELD_CONTAINER_CLASS} ${CONTAINER_SIZE_CLASS[inputSize]} ${containerClassName}`}
      >
        <FieldLabel htmlFor={textareaId} label={label} required={required} />

        {/* reset.css가 textarea의 border와 padding을 제거하므로 두 스타일은 바깥 컨테이너가 담당합니다. */}
        <div
          aria-busy={isLoading || undefined}
          className={`relative h-40 overflow-hidden rounded-2xl border bg-[var(--gray-50)] transition-colors ${TEXTAREA_SIZE_CLASS[inputSize]} ${fieldStateClass} ${
            isDisabled ? "cursor-not-allowed bg-[var(--gray-100)]" : ""
          }`}
        >
          <textarea
            {...textareaProps}
            ref={ref}
            id={textareaId}
            required={required}
            disabled={isDisabled}
            aria-describedby={describedBy}
            aria-invalid={hasError || ariaInvalid || undefined}
            className={`text-lg-regular h-full w-full resize-none bg-transparent text-[var(--black-400)] outline-none placeholder:text-[var(--gray-300)] disabled:cursor-not-allowed disabled:text-[var(--gray-400)] ${className}`}
          />
          {/* spinner는 입력 내용 위에 겹치되 레이아웃 크기를 바꾸지 않도록 절대 배치합니다. */}
          {isLoading ? (
            <LoadingSpinner className={`absolute ${SPINNER_POSITION_CLASS[inputSize]}`} />
          ) : null}
        </div>

        <FieldMessage id={messageId} message={message} hasError={hasError} />
      </div>
    );
  },
);
