interface FieldLabelProps {
  htmlFor: string;
  label?: string;
  required?: boolean;
}

interface FieldMessageProps {
  id: string;
  message?: string;
  hasError?: boolean;
}

interface LoadingSpinnerProps {
  className?: string;
}

/** Input과 Textarea가 동일한 label-field-message 간격을 유지하도록 하는 공통 배치 클래스입니다. */
export const FIELD_CONTAINER_CLASS = "flex w-full flex-col gap-2";

/**
 * 오류 상태가 hover/focus 상태보다 항상 우선하도록 테두리 클래스를 한 곳에서 결정합니다.
 * 오류가 없을 때만 Figma의 default → hover → typing(focus) 상태 전환을 허용합니다.
 */
export function getFieldStateClass(hasError: boolean) {
  return hasError
    ? "border-[var(--primary-400)]"
    : "border-[var(--line-200)] hover:border-[var(--gray-300)] focus-within:border-[var(--primary-400)]";
}

/**
 * 호출자가 전달한 설명 id와 컴포넌트 내부 도움말 id를 공백으로 연결합니다.
 * 값이 하나도 없으면 aria-describedby 자체가 렌더링되지 않도록 undefined를 반환합니다.
 */
export function buildDescribedBy(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(" ") || undefined;
}

/** 시각적 label과 native form control을 htmlFor/id로 연결하고 필수 입력 표시를 제공합니다. */
export function FieldLabel({ htmlFor, label, required = false }: FieldLabelProps) {
  if (!label) return null;

  return (
    <label className="text-md-medium text-[var(--black-400)]" htmlFor={htmlFor}>
      {label}
      {required ? (
        <span aria-hidden="true" className="ml-1 text-[var(--primary-400)]">
          *
        </span>
      ) : null}
    </label>
  );
}

/**
 * 도움말과 오류 문구가 같은 위치와 타이포그래피를 사용하게 합니다.
 * 오류일 때 role="alert"를 부여해 이미 화면을 보고 있는 사용자에게 변경을 알립니다.
 */
export function FieldMessage({ id, message, hasError = false }: FieldMessageProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role={hasError ? "alert" : undefined}
      className={`text-xs-medium px-1 ${
        hasError ? "text-[var(--primary-400)]" : "text-[var(--gray-400)]"
      }`}
    >
      {message}
    </p>
  );
}

/**
 * 세 Input 계열이 공유하는 20px 로딩 표시입니다.
 * 실제 로딩 여부는 부모의 aria-busy와 disabled 상태로 전달하므로 아이콘은 스크린 리더에서 숨깁니다.
 */
export function LoadingSpinner({ className = "" }: LoadingSpinnerProps) {
  return (
    <span
      aria-hidden="true"
      className={`size-5 shrink-0 animate-spin rounded-full border-2 border-[var(--gray-200)] border-t-[var(--primary-400)] ${className}`}
    />
  );
}
