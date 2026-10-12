import { USER_ROLE } from "@/common/constants/domain";
import type { AuthUser } from "@/features/auth/auth.types";

import { REGION_FILTER_OPTIONS } from "./mover-search.constants";
import type {
  MoverSearchSidebarVariant,
  MoverSearchViewer,
} from "./mover-search.types";

/** API가 돌려주는 지역 value(예: "seoul")를 한국어 label(예: "서울")로 바꿉니다. 매칭 실패 시 원본 값을 그대로 둡니다. */
export function getRegionLabel(value: string): string {
  return (
    REGION_FILTER_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function getMoverSearchViewer(
  user: AuthUser | null,
  isAuthPending: boolean,
  hasAuthError = false,
): MoverSearchViewer {
  if (isAuthPending && !hasAuthError) {
    return "pending";
  }
  if (user?.role === USER_ROLE.CUSTOMER) {
    return "customer";
  }
  if (user?.role === USER_ROLE.MOVER) {
    return "mover";
  }
  return "guest";
}

export function getMoverSearchSidebarVariant(
  viewer: MoverSearchViewer,
): MoverSearchSidebarVariant {
  return viewer === "customer" ? "favorite" : "recommended";
}
