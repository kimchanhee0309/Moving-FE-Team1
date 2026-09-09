"use client";

import Image from "next/image";

import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

/**
 * 이사 유형(`ServiceType`)별 고정 표시 내용. 서비스가 다루는 이사 유형은
 * `SERVICE_TYPE` 3종으로 고정돼 있어(도메인 상수 자체가 확장 시에만 바뀜),
 * 호출부마다 title/description/icon을 반복 전달하지 않고 이 컴포넌트가 직접 소유한다.
 */
const MOVE_TYPE_CONTENT: Record<
  ServiceType,
  { title: string; description: string; imageSrc: string }
> = {
  [SERVICE_TYPE.SMALL]: {
    title: "소형이사",
    description: "원룸, 투룸, 20평대 미만",
    imageSrc: "/images/move-type-small.png",
  },
  [SERVICE_TYPE.HOME]: {
    title: "가정이사",
    description: "쓰리룸, 20평대 이상",
    imageSrc: "/images/move-type-home.png",
  },
  [SERVICE_TYPE.OFFICE]: {
    title: "사무실이사",
    description: "사무실, 상업공간",
    imageSrc: "/images/move-type-office.png",
  },
};

export interface MoveTypeCardProps {
  /**
   * 같은 선택지 묶음(이사 유형 3종) 안에서 공유해야 하는 radio input의 name.
   * 브라우저 네이티브 radio 동작을 사용해 한 번에 하나만 선택되도록 한다.
   */
  name: string;
  /** 이 카드가 나타내는 이사 유형. 제목/설명/이미지는 이 값으로 고정 결정된다. */
  value: ServiceType;
  /** 현재 선택 여부 (controlled). */
  checked: boolean;
  /** 선택이 바뀔 때 호출된다. 실제 상태 관리는 호출부가 소유한다. */
  onChange: (value: ServiceType) => void;
  className?: string;
}

/**
 * 이사 유형(소형이사/가정이사/사무실이사 등) 중 하나를 고르는 카드형 선택 컴포넌트.
 *
 * 시각적으로는 체크 표시가 있는 카드이지만, 실제로는 여러 카드 중 하나만 고를 수 있는
 * `radio` 그룹의 일부로 동작한다(동시에 여러 개를 선택할 수 없음). 같은 그룹에 속한
 * 카드들은 반드시 동일한 `name`을 공유해야 한다.
 *
 * 반응형: 743px 이하에서는 가로 배치(체크/텍스트 좌측, 이미지 우측),
 * 744px 이상(태블릿/데스크톱)에서는 세로 배치(체크/텍스트 상단, 이미지 하단)로 바뀐다.
 * 744px는 이 카드를 사용하는 견적 요청 페이지의 태블릿 breakpoint(Figma 기준)와
 * 동일하게 맞춘 값이다 — Tailwind 기본 `md:`(768px)를 쓰면 744~767px 구간에서 카드가
 * 세로 전환 전 상태로 남아 체크+텍스트 폭이 좁아져 설명 문구가 원치 않게 줄바꿈된다.
 * hover 스타일도 동일하게 `min-[744px]:hover:`로 제한한다.
 *
 * 제목/설명 텍스트 wrapper에 `shrink-0 whitespace-nowrap`을 준 것은 Figma 원본(`card` 컴포넌트)의
 * 실제 마크업과 동일하게 맞춘 것이다. 이게 없으면(기본 `white-space: normal`) 브라우저가 flex item의
 * `min-width: auto`를 한글 텍스트가 아무 글자에서나 줄바꿈 가능한 최소 폭까지로 계산해버려서,
 * 실제로는 한 줄에 들어갈 수 있는 너비인데도 "20평대 미만"의 "미만"만 다음 줄로 밀려나는 문제가 있었다.
 * `shrink-0 whitespace-nowrap`로 텍스트 폭을 고정해야 Figma와 동일하게 한 줄로 유지된다.
 */
export function MoveTypeCard({
  name,
  value,
  checked,
  onChange,
  className,
}: MoveTypeCardProps) {
  const { title, description, imageSrc } = MOVE_TYPE_CONTENT[value];

  return (
    <label
      className={[
        "group relative flex w-full cursor-pointer flex-row items-start gap-2 rounded-2xl px-4 py-5",
        "min-[744px]:flex-col min-[744px]:items-end min-[744px]:gap-4 min-[744px]:pt-5 min-[744px]:pb-4",
        checked
          ? "border-2 border-[var(--primary-400)] bg-[var(--primary-100)]"
          : [
              "border border-transparent bg-[var(--background-200)]",
              "min-[744px]:hover:border-[var(--gray-300)] min-[744px]:hover:bg-[var(--background-300)]",
            ].join(" "),
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
        onChange={() => onChange(value)}
        className="peer sr-only"
      />
      {/* 키보드 포커스 표시 전용 오버레이. 카드 자체는 label이라 배경색 대신 ring으로 표시한다. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--primary-400)] peer-focus-visible:ring-offset-2"
      />

      <div className="flex flex-1 flex-col items-start gap-2 min-[744px]:w-full min-[744px]:flex-none min-[744px]:flex-row min-[744px]:items-start">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center"
        >
          <CheckIndicator checked={checked} />
        </span>
        <div className="flex shrink-0 flex-col items-start justify-center whitespace-nowrap">
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

      <div className="size-[120px] shrink-0">
        <Image
          src={imageSrc}
          alt=""
          width={120}
          height={120}
          className="size-full object-contain"
        />
      </div>
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
      className="size-[18px] stroke-[var(--gray-300)] min-[744px]:group-hover:stroke-[var(--gray-200)]"
    >
      <circle cx="9" cy="9" r="8.5" />
    </svg>
  );
}
