import { USER_ROLE, type UserRole } from "@/common/constants/domain";
import { ROUTES } from "@/common/constants/routes";

import type { GnbNavItem } from "./gnb.types";

export const GNB_GUEST_NAV_ITEMS: GnbNavItem[] = [
  { label: "기사님 찾기", href: ROUTES.PUBLIC.MOVER_SEARCH },
];

export const GNB_NAV_ITEMS_BY_ROLE: Record<UserRole, GnbNavItem[]> = {
  [USER_ROLE.CUSTOMER]: [
    { label: "견적 요청", href: ROUTES.CUSTOMER.MOVE_REQUEST },
    { label: "기사님 찾기", href: ROUTES.PUBLIC.MOVER_SEARCH },
    { label: "내 견적 관리", href: ROUTES.CUSTOMER.QUOTE.PENDING },
  ],
  [USER_ROLE.MOVER]: [
    { label: "받은 요청", href: ROUTES.MOVER.REQUESTS },
    { label: "내 견적 관리", href: ROUTES.MOVER.QUOTE.LIST },
  ],
};

export const GNB_DEFAULT_LOGIN_HREF = ROUTES.AUTH.LOGIN.CUSTOMER;
