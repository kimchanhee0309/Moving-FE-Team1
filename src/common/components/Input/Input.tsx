"use client";

import Image from "next/image";
import {
  forwardRef,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import {
  buildDescribedBy,
  FIELD_CONTAINER_CLASS,
  FieldLabel,
  FieldMessage,
  getFieldStateClass,
  LoadingSpinner,
} from "./InputParts";
import type { AccessibleFieldLabelProps } from "./Input.types";

/** Figma Input component set에서 제공하는 모바일(sm)·데스크톱(md) 크기입니다. */
export type InputSize = "sm" | "md";

interface InputOwnProps {
  /** 기본값은 sm이며 Figma의 두 size variant 중 하나를 선택합니다. */
  inputSize?: InputSize;
  /** 값이 있으면 오류 테두리·문구·aria-invalid를 함께 활성화합니다. */
  error?: string;
  /** 오류가 아닌 입력 도움말입니다. error가 있으면 오류 문구가 우선합니다. */
  helperText?: string;
  /** 로딩 중에는 중복 입력을 막기 위해 input을 disabled 처리하고 spinner를 표시합니다. */
  isLoading?: boolean;
  /** 입력값 왼쪽에 표시할 비상호작용 아이콘입니다. */
  leadingIcon?: ReactNode;
  /** 입력값 오른쪽 아이콘입니다. loading과 password 아이콘보다 우선순위가 낮습니다. */
  trailingIcon?: ReactNode;
  /** label, field, message를 감싸는 최상위 컨테이너의 추가 클래스입니다. */
  containerClassName?: string;
}

/**
 * Outlined Input의 공개 계약입니다.
 * native input props를 그대로 지원하므로 value/onChange를 이용한 controlled 방식과
 * defaultValue를 이용한 uncontrolled 방식을 모두 사용할 수 있습니다.
 * label이 없으면 aria-label을 필수로 요구하며, 오류는 안내 문구인 error로만 활성화합니다.
 */
export type InputProps = Omit<
  ComponentPropsWithoutRef<"input">,
  "size" | "aria-label"
> &
  AccessibleFieldLabelProps &
  InputOwnProps;

// Figma 수치: sm 327px, md 640px. w-full과 함께 사용해 더 작은 viewport에서는 자연스럽게 줄어듭니다.
const CONTAINER_SIZE_CLASS: Record<InputSize, string> = {
  sm: "max-w-[327px]",
  md: "max-w-[640px]",
};

// Figma 수치: sm 56px/14px padding, md 64px/좌 14px·우 24px padding.
const FIELD_SIZE_CLASS: Record<InputSize, string> = {
  sm: "h-14 px-[14px]",
  md: "h-16 py-[14px] pl-[14px] pr-6",
};

/**
 * Figma의 input/text_field/outlined를 구현한 공통 입력 컴포넌트입니다.
 * 값 검증 자체는 각 feature form이 담당하고, 이 컴포넌트는 상태 표현과 접근성 연결만 담당합니다.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    id,
    label,
    inputSize = "sm",
    error,
    helperText,
    isLoading = false,
    leadingIcon,
    trailingIcon,
    containerClassName = "",
    className = "",
    type = "text",
    disabled = false,
    required = false,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    ...inputProps
  },
  ref,
) {
  // id가 없는 사용처도 label과 도움말을 안정적으로 연결할 수 있도록 React 고유 id를 생성합니다.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  // 오류 문구가 있을 때만 테두리와 aria-invalid를 함께 활성화해 색상만 있는 오류를 방지합니다.
  const hasError = Boolean(error);
  // 오류와 도움말이 동시에 전달되면 사용자가 먼저 해결해야 하는 오류를 우선 노출합니다.
  const message = error ?? helperText;
  // loading 중 값이 바뀌거나 재전송되는 것을 막기 위해 native disabled 동작을 재사용합니다.
  const isDisabled = disabled || isLoading;
  const isPassword = type === "password";

  // 비밀번호 노출 여부는 해당 input에만 필요한 일시적인 UI 상태이므로 전역 상태로 올리지 않습니다.
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const resolvedType = isPassword && isPasswordVisible ? "text" : type;

  // 외부 설명과 내부 메시지를 모두 보조 기술이 읽을 수 있도록 id 목록을 병합합니다.
  const describedBy = buildDescribedBy(ariaDescribedBy, message ? messageId : undefined);
  const fieldStateClass = getFieldStateClass(hasError);

  return (
    <div
      className={`${FIELD_CONTAINER_CLASS} ${CONTAINER_SIZE_CLASS[inputSize]} ${containerClassName}`}
    >
      <FieldLabel htmlFor={inputId} label={label} required={required} />

      <div
        aria-busy={isLoading || undefined}
        className={`flex w-full items-center gap-2 rounded-2xl border bg-[var(--gray-50)] transition-colors ${FIELD_SIZE_CLASS[inputSize]} ${fieldStateClass} ${
          isDisabled ? "cursor-not-allowed bg-[var(--gray-100)]" : ""
        }`}
      >
        {leadingIcon ? (
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center">
            {leadingIcon}
          </span>
        ) : null}

        <input
          {...inputProps}
          ref={ref}
          id={inputId}
          type={resolvedType}
          required={required}
          disabled={isDisabled}
          aria-describedby={describedBy}
          aria-invalid={hasError || ariaInvalid || undefined}
          className={`text-lg-regular min-w-0 flex-1 bg-transparent text-[var(--black-400)] outline-none placeholder:text-[var(--gray-300)] disabled:cursor-not-allowed disabled:text-[var(--gray-400)] ${className}`}
        />

        {/* 우측 요소 우선순위: loading → password toggle → 호출자가 전달한 아이콘 */}
        {isLoading ? (
          <LoadingSpinner />
        ) : isPassword ? (
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)]"
            aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
            aria-pressed={isPasswordVisible}
            onClick={() => setIsPasswordVisible((current) => !current)}
          >
            {/* 버튼의 accessible name은 aria-label이 담당하므로 장식 아이콘의 alt는 비워 둡니다. */}
            <Image
              src={
                isPasswordVisible
                  ? "/icons/input/visibility.svg"
                  : "/icons/input/visibility-off.svg"
              }
              alt=""
              width={24}
              height={24}
              unoptimized
            />
          </button>
        ) : trailingIcon ? (
          <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center">
            {trailingIcon}
          </span>
        ) : null}
      </div>

      <FieldMessage id={messageId} message={message} hasError={hasError} />
    </div>
  );
});
