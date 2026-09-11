import { USER_ROLE } from "@/common/constants/domain";
import type { AuthUser } from "@/features/auth/auth.types";

import { MOCK_FAVORITE_MOVER_IDS } from "./mover-search.mock";
import type {
  MoverSearchSidebarVariant,
  MoverSearchViewer,
} from "./mover-search.types";

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

export function getDisplayedFavoriteCount(
  baseCount: number,
  moverId: string,
  isFavorite: boolean,
  shouldApplyToggleDelta: boolean,
) {
  if (!shouldApplyToggleDelta) {
    return baseCount;
  }

  const wasInitiallyFavorite = (
    MOCK_FAVORITE_MOVER_IDS as readonly string[]
  ).includes(moverId);

  return baseCount + Number(isFavorite) - Number(wasInitiallyFavorite);
}
