import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ProfileSelectionChipSize = "sm" | "md";

export interface ProfileSelectionChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> {
  /** Chip 안에 표시할 서비스 종류 또는 서비스 가능 지역 이름입니다. */
  children: ReactNode;
  /** 선택 상태는 호출부가 소유하며, 이 값으로 `aria-pressed`도 함께 설정됩니다. */
  isSelected: boolean;
  /** Figma `chip/지역`의 sm(프로필 모바일)·md(프로필 넓은 화면) 규격입니다. */
  size?: ProfileSelectionChipSize;
  /** 저장 중에는 중복 선택을 막고 loading 표시를 우선합니다. */
  isLoading?: boolean;
  /** 그룹 단위 검증 실패를 시각적으로 표시할 때 사용합니다. 오류 문구는 그룹의 `aria-describedby`로 연결합니다. */
  isInvalid?: boolean;
  /** 클릭 결과의 다음 선택 상태를 전달하는 controlled callback입니다. */
  onSelectedChange?: (isSelected: boolean) => void;
}

export interface ProfileSelectionChipOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface ProfileSingleSelectChipGroupProps<T extends string = string> {
  /** 같은 `name`을 가진 native radio로 한 항목만 선택되게 보장합니다. */
  name: string;
  options: ReadonlyArray<ProfileSelectionChipOption<T>>;
  value: T | null;
  onValueChange: (value: T) => void;
  size?: ProfileSelectionChipSize;
  disabled?: boolean;
  isLoading?: boolean;
  isInvalid?: boolean;
  required?: boolean;
  className?: string;
  ariaLabel: string;
  ariaDescribedBy?: string;
}

export interface ProfileMultiSelectChipGroupProps<T extends string = string> {
  options: ReadonlyArray<ProfileSelectionChipOption<T>>;
  values: ReadonlyArray<T>;
  onValuesChange: (values: T[]) => void;
  size?: ProfileSelectionChipSize;
  disabled?: boolean;
  isLoading?: boolean;
  isInvalid?: boolean;
  className?: string;
  ariaLabel: string;
  ariaDescribedBy?: string;
}
