import Image from "next/image";
import { useTranslations } from "next-intl";

import { SERVICE_TYPE } from "@/common/constants/domain";

import {
  DESIGNATED_REQUEST_CHIP,
  type MoveTypeChipProps,
  type MoveTypeChipSize,
  type MoveTypeChipVariant,
} from "./MoveTypeChip.types";

interface MoveTypeChipVisual {
  labelKey: "SMALL" | "HOME" | "OFFICE" | "designated";
  iconSrc: string;
  colorClassName: string;
}

const CHIP_VISUAL: Record<MoveTypeChipVariant, MoveTypeChipVisual> = {
  [SERVICE_TYPE.SMALL]: {
    labelKey: "SMALL",
    iconSrc: "/icons/ic-solid-box.svg",
    colorClassName: "bg-[var(--primary-100)] text-[var(--primary-400)]",
  },
  [SERVICE_TYPE.HOME]: {
    labelKey: "HOME",
    iconSrc: "/icons/common-chip-mypage/ic-solid-home.svg",
    colorClassName: "bg-[var(--primary-100)] text-[var(--primary-400)]",
  },
  [SERVICE_TYPE.OFFICE]: {
    labelKey: "OFFICE",
    iconSrc: "/icons/ic-solid-company.svg",
    colorClassName: "bg-[var(--primary-100)] text-[var(--primary-400)]",
  },
  [DESIGNATED_REQUEST_CHIP]: {
    labelKey: "designated",
    iconSrc: "/icons/ic-solid-document.svg",
    colorClassName:
      "bg-[var(--secondary-red-100)] text-[var(--secondary-red-200)]",
  },
};

const SIZE_CLASS: Record<MoveTypeChipSize, string> = {
  // Figma Chip/이사유형 sm: 상하 2px, 좌 4px, 우 7px, gap 2px, radius 4px.
  sm: "gap-0.5 rounded py-0.5 pl-1 pr-[7px] text-sm-semibold",
  // Figma Chip/이사유형 md: 상하 4px, 좌 5px, 우 7px, gap 4px, radius 6px.
  md: "gap-1 rounded-md py-1 pl-[5px] pr-[7px] text-md-semibold",
  // 실제 카드에서 사용하는 반응형 전환 기준과 맞춰 작은 화면에서 sm을 유지합니다.
  responsive:
    "gap-0.5 rounded py-0.5 pl-1 pr-[7px] text-sm-semibold min-[558px]:gap-1 min-[558px]:rounded-md min-[558px]:py-1 min-[558px]:pl-[5px] min-[558px]:text-md-semibold",
};

/**
 * 카드·리뷰·견적 화면에서 이사 유형 또는 지정 요청 여부를 읽기 전용으로 표시합니다.
 * 클릭이나 필터 상태는 소유하지 않으며 API의 ServiceType을 그대로 받아 라벨과 아이콘만 매핑합니다.
 */
export function MoveTypeChip({
  variant,
  size = "responsive",
  isLoading = false,
  className,
  ...spanProps
}: MoveTypeChipProps) {
  const t = useTranslations("MoveType");
  const visual = CHIP_VISUAL[variant];

  return (
    <span
      {...spanProps}
      aria-busy={isLoading || undefined}
      className={[
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap",
        "shadow-[4px_4px_8px_rgba(217,217,217,0.1)]",
        SIZE_CLASS[size],
        visual.colorClassName,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {isLoading ? (
        <span
          className="h-5 w-14 animate-pulse rounded bg-current opacity-15"
          aria-label={t("chipLoading")}
        />
      ) : (
        <>
          <Image
            src={visual.iconSrc}
            alt=""
            width={20}
            height={20}
            className="size-5 shrink-0 object-contain"
            aria-hidden="true"
          />
          <span>{t(visual.labelKey)}</span>
        </>
      )}
    </span>
  );
}
