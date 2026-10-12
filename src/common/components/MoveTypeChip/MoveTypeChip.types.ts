import type { HTMLAttributes } from "react";

import type { ServiceType } from "@/common/constants/domain";

export const DESIGNATED_REQUEST_CHIP = "DESIGNATED_REQUEST" as const;

export type MoveTypeChipVariant =
  | ServiceType
  | typeof DESIGNATED_REQUEST_CHIP;

export type MoveTypeChipSize = "sm" | "md" | "responsive";

type StaticChipAttributes = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "onClick" | "onDoubleClick" | "onKeyDown" | "onKeyPress" | "onKeyUp"
>;

export interface MoveTypeChipProps extends StaticChipAttributes {
  /** API의 이사 유형 값 또는 지정 견적 요청 라벨을 선택합니다. */
  variant: MoveTypeChipVariant;
  /** `responsive`는 558px 미만에서 sm, 그 이상에서 md 규격을 사용합니다. */
  size?: MoveTypeChipSize;
  /** 서버 데이터가 준비되지 않은 동안 라벨 대신 같은 높이의 로딩 표시를 노출합니다. */
  isLoading?: boolean;
}
