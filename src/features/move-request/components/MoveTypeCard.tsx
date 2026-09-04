"use client";

import type { ReactNode } from "react";

export interface MoveTypeCardProps {
  /**
   * 같은 선택지 묶음(예: 이사 유형 3종) 안에서 공유해야 하는 radio input의 name.
   * 브라우저 네이티브 radio 동작을 사용해 한 번에 하나만 선택되도록 한다.
   */
  name: string;
  /** 이 카드가 선택됐을 때 상위로 전달되는 값 (예: SERVICE_TYPE.SMALL 등). */
  value: string;
  /** 카드 제목 (예: "소형이사"). */
  title: string;
  /** 카드 설명 (예: "원룸, 투룸, 20평대 미만"). */
  description: string;
  /**
   * 카드 우측(모바일) 또는 하단(태블릿/데스크톱)에 표시할 일러스트.
   * 이 컴포넌트는 이미지 소스를 소유하지 않으므로 호출부가 `next/image` 등으로 주입한다.
   */
  icon: ReactNode;
  /** 현재 선택 여부 (controlled). */
  checked: boolean;
  /** 선택이 바뀔 때 호출된다. 실제 상태 관리는 호출부가 소유한다. */
  onChange: (value: string) => void;
  /** 비활성화 여부. Figma에는 정의되어 있지 않은 확장 상태다. */
  disabled?: boolean;
  className?: string;
}

/**
 * 이사 유형(소형이사/가정이사/사무실이사 등) 중 하나를 고르는 카드형 선택 컴포넌트.
 *
 * 시각적으로는 체크 표시가 있는 카드이지만, 실제로는 여러 카드 중 하나만 고를 수 있는
 * `radio` 그룹의 일부로 동작한다(동시에 여러 개를 선택할 수 없음). 같은 그룹에 속한
 * 카드들은 반드시 동일한 `name`을 공유해야 한다.
 *
 * 반응형: 767px 이하에서는 가로 배치(체크/텍스트 좌측, 이미지 우측),
 * 768px 이상(태블릿/데스크톱)에서는 세로 배치(체크/텍스트 상단, 이미지 하단)로 바뀐다.
 * Figma 파일에 실제 모바일 전체 화면 프레임이 없어 정확한 breakpoint px 값을 확인하지
 * 못했고, 팀 컨벤션 폴백값(Tablet 768px)과 Tailwind 기본 `md:` breakpoint를 사용했다.
 * hover 스타일은 Figma에도 데스크톱/태블릿에만 정의되어 있어 `md:hover:`로 제한한다.
 */
export function MoveTypeCard({
  name,
  value,
  title,
  description,
  icon,
  checked,
  onChange,
  disabled = false,
  className,
}: MoveTypeCardProps) {
  return (
    <label
      className={[
        "group relative flex w-full cursor-pointer flex-row items-start gap-2 rounded-2xl px-4 py-5",
        "md:flex-col md:items-end md:gap-4 md:pt-5 md:pb-4",
        checked
          ? "border-2 border-[var(--primary-400)] bg-[var(--primary-100)]"
          : [
              "border border-transparent bg-[var(--background-200)]",
              "md:hover:border-[var(--gray-300)] md:hover:bg-[var(--background-300)]",
            ].join(" "),
        disabled ? "cursor-not-allowed opacity-50" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      {/* 키보드 포커스 표시 전용 오버레이. 카드 자체는 label이라 배경색 대신 ring으로 표시한다. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary-400)] peer-focus-visible:ring-offset-2"
      />

      <div className="flex flex-1 flex-col items-start gap-2 md:w-full md:flex-none md:flex-row md:items-start">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center"
        >
          <CheckIndicator checked={checked} />
        </span>
        <div className="flex flex-col items-start justify-center">
          <p
            className={
              checked
                ? "text-lg-semibold text-[var(--primary-400)]"
                : "text-lg-semibold text-[var(--black-500)]"
            }
          >
            {title}
          </p>
          <p
            className={
              checked
                ? "text-md-regular text-[var(--primary-400)]"
                : "text-md-regular text-[var(--gray-500)]"
            }
          >
            {description}
          </p>
        </div>
      </div>

      <div className="size-[120px] shrink-0">{icon}</div>
    </label>
  );
}

function CheckIndicator({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        className="size-[18px]"
      >
        <circle cx="9" cy="9" r="9" fill="var(--primary-400)" />
        <path
          d="M5 9L8 12L13 7"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="size-[18px] stroke-[var(--gray-300)] md:group-hover:stroke-[var(--gray-200)]"
    >
      <circle cx="9" cy="9" r="8.5" />
    </svg>
  );
}
