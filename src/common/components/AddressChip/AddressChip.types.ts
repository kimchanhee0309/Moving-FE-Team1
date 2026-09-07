import type { HTMLAttributes, ReactNode } from "react";

export type AddressChipSize = "sm" | "md" | "responsive";

type StaticChipAttributes = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "onClick" | "onDoubleClick" | "onKeyDown" | "onKeyPress" | "onKeyUp"
>;

export interface AddressChipProps extends StaticChipAttributes {
  /** 도로명·지번 등 주소 형식을 나타내는 짧은 라벨입니다. */
  children: ReactNode;
  /** `responsive`는 558px 미만에서 sm, 그 이상에서 md 규격을 사용합니다. */
  size?: AddressChipSize;
  /** 주소 정보가 준비되지 않은 동안 라벨 대신 로딩 표시를 노출합니다. */
  isLoading?: boolean;
}
