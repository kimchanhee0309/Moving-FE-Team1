import { USER_ROLE, type UserRole } from "@/common/constants/domain";
import { ROUTES } from "@/common/constants/routes";

import type { GnbNavItem, GnbProfileMenuItem } from "./gnb.types";

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

/**
 * `GnbProfileMenu`(GNB 아바타 클릭 시 열리는 프로필 드롭다운)의 role별 이동형 메뉴 항목.
 * Figma 프로필 드롭다운 컴포넌트(기사님용 `property2=md`, 고객님용 `property2=sm`) 기준이며,
 * "로그아웃"은 이동이 아닌 액션이라 포함하지 않는다(`GnbProfileMenuProps.onLogout` 참고).
 *
 * AGENTS.md 12번 규칙대로 customer는 "프로필 수정"으로 바로 이동하고,
 * mover는 "마이페이지"를 거쳐 프로필 수정으로 이동하므로(드롭다운에는 "마이페이지"만 노출) 두 role의
 * 항목 라벨/개수가 서로 다르다.
 */
export const GNB_PROFILE_MENU_ITEMS_BY_ROLE: Record<UserRole, GnbProfileMenuItem[]> = {
  [USER_ROLE.CUSTOMER]: [
    { label: "프로필 수정", href: ROUTES.CUSTOMER.PROFILE.EDIT },
    { label: "찜한 기사님", href: ROUTES.CUSTOMER.FAVORITE },
    { label: "이사 리뷰", href: ROUTES.CUSTOMER.REVIEW.WRITTEN },
  ],
  [USER_ROLE.MOVER]: [{ label: "마이페이지", href: ROUTES.MOVER.MY_PAGE }],
};

/** `GnbProfileMenu` 상단 인사말("OOO 고객님" / "OOO 기사님")에 이름 뒤에 붙일 접미사. */
export const GNB_PROFILE_GREETING_SUFFIX_BY_ROLE: Record<UserRole, string> = {
  [USER_ROLE.CUSTOMER]: "고객님",
  [USER_ROLE.MOVER]: "기사님",
};
