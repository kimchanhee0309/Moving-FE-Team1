import type { RefObject } from "react";

import type { UserRole } from "@/common/constants/domain";

export interface GnbNavItem {
  /** 메뉴에 보여줄 라벨 (예: "견적 요청") */
  label: string;
  /** 클릭 시 이동할 경로. `src/common/constants/routes.ts`의 `ROUTES` 값을 사용한다. */
  href: string;
}

/**
 * `GnbMobileMenu`(햄버거 버튼을 눌렀을 때 오른쪽에서 슬라이드로 나타나는 사이드 드로어 메뉴)의 props.
 * `Gnb` 내부에서만 사용하는 컴포넌트이므로 barrel(`index.ts`)에는 export하지 않는다.
 */
export interface GnbMobileMenuProps {
  /** 드로어 바깥 오버레이(backdrop + panel)의 DOM id. 햄버거 버튼의 `aria-controls`와 짝을 이룬다. */
  menuId: string;
  /** 역할(customer/mover)에 따라 이미 필터링된 네비게이션 항목 목록. */
  navItems: GnbNavItem[];
  /** 로그인 여부. `false`면 목록 맨 아래에 로그인 버튼을 보여준다. */
  isAuthenticated: boolean;
  /** 로그인 버튼이 이동할 경로. */
  loginHref: string;
  /** 드로어가 열릴 때 포커스를 옮길 첫 번째 링크에 연결하는 ref. */
  firstNavLinkRef: RefObject<HTMLAnchorElement | null>;
  /**
   * 메뉴 안의 링크(네비게이션 항목, 로그인 버튼)를 클릭해 실제로 다른 화면으로 이동하면서
   * 드로어를 닫을 때 호출하는 콜백. `onClose`와 로직이 겹쳐도 되지만, "이동을 동반한 닫기"라는
   * 의미를 분리하기 위해 이름을 구분한다.
   */
  onNavigate: () => void;
  /**
   * 화면 이동 없이 드로어만 닫을 때(딤 처리된 backdrop 클릭, 패널 상단의 닫기(X) 버튼 클릭) 호출하는 콜백.
   * 부모가 이 콜백 안에서 "명시적으로 닫기"에 필요한 후속 처리(예: 햄버거 버튼으로 포커스 복귀)를 수행한다.
   */
  onClose: () => void;
}

export interface GnbAuthenticatedUser {
  role: UserRole;
  name: string;
  profileHref: string;
}

interface GnbBaseProps {
  hasUnreadNotification?: boolean;
  loginHref?: string;
  onNotificationClick?: () => void;
  className?: string;
}

export type GnbProps =
  | (GnbBaseProps & { isAuthenticated?: false })
  | (GnbBaseProps & { isAuthenticated: true; user: GnbAuthenticatedUser });
