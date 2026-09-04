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

/** 로그인한 사용자가 GNB에 표시할 정보. */
export interface GnbAuthenticatedUser {
  /** customer/mover 등 역할. 어떤 네비게이션 항목/프로필 드롭다운 메뉴를 보여줄지 결정한다. */
  role: UserRole;
  /** GNB 아바타 옆에 보여줄 이름(닉네임). 프로필 드롭다운 상단 인사말("OOO 고객님"/"OOO 기사님")에도 그대로 쓰인다. */
  name: string;
}

/**
 * `GnbProfileMenu`(GNB 아바타를 클릭하면 트리거 바로 아래에 나타나는 anchored 드롭다운)의
 * 이동형 메뉴 항목. 로그아웃은 페이지 이동이 아닌 액션이라 이 목록에 포함하지 않고
 * `GnbProfileMenuProps.onLogout` 콜백으로 별도 처리한다.
 */
export interface GnbProfileMenuItem {
  /** 메뉴에 보여줄 라벨 (예: "마이페이지", "프로필 수정"). */
  label: string;
  /** 클릭 시 이동할 경로. `src/common/constants/routes.ts`의 `ROUTES` 값을 사용한다. */
  href: string;
  /**
   * 라벨 앞에 보여줄 아이콘 이미지 경로. 현재 Figma 프로필 드롭다운 디자인(기사님/고객님 공통)에는
   * 항목 아이콘이 없어 사용하지 않지만, 추후 아이콘이 추가되는 경우를 위해 옵셔널로 남겨둔다.
   */
  icon?: string;
}

/**
 * `GnbProfileMenu`의 props. `Gnb`가 열림 상태를 소유하는 controlled 컴포넌트이므로
 * 이 컴포넌트는 자체 open state를 갖지 않고, 열려 있을 때만 부모에 의해 마운트된다.
 * `Gnb` 내부에서만 사용하는 컴포넌트이므로 barrel(`index.ts`)에는 export하지 않는다.
 */
export interface GnbProfileMenuProps {
  /** 드롭다운 패널의 DOM id. 트리거(아바타) 버튼의 `aria-controls`와 짝을 이룬다. */
  menuId: string;
  /**
   * 로그인한 사용자의 role. 인사말 접미사와 항목 구성을 결정한다. 치수/타이포그래피는 role과
   * 무관하게 화면 폭(PC vs 태블릿/모바일)에 따라 반응형으로 달라진다.
   */
  role: UserRole;
  /** GNB 아바타 옆에 표시되는 사용자 이름(닉네임). 드롭다운 상단 인사말에 그대로 노출된다. */
  userName: string;
  /** role별로 이미 필터링된 이동형 메뉴 항목(로그아웃 제외). `GNB_PROFILE_MENU_ITEMS_BY_ROLE`를 참고한다. */
  items: GnbProfileMenuItem[];
  /** 드롭다운이 열릴 때 포커스를 옮길 첫 번째 메뉴 항목에 연결하는 ref. */
  firstItemRef: RefObject<HTMLAnchorElement | null>;
  /**
   * 트리거(아바타) 버튼의 ref. 바깥 클릭 감지 시 트리거 자신을 클릭한 것까지
   * "메뉴 바깥 클릭"으로 오인해 토글이 즉시 재닫힘되는 것을 막기 위해 필요하다.
   */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** 메뉴의 이동형 항목을 클릭해 실제로 다른 화면으로 이동하면서 드롭다운을 닫을 때 호출하는 콜백. */
  onNavigate: () => void;
  /**
   * "로그아웃" 항목 클릭 시 호출되는 콜백. `Gnb`는 실제 로그아웃 API 호출/세션 정리 로직을
   * 갖지 않으므로(공통 컴포넌트 원칙) 이 콜백에서 실제 로그아웃 처리를 하도록 위임한다.
   */
  onLogout: () => void;
  /**
   * 화면 이동 없이 드롭다운만 닫을 때(Esc, 바깥 클릭) 호출하는 콜백. 부모가 이 콜백 안에서
   * 트리거(아바타) 버튼으로 포커스를 복귀시킨다.
   */
  onClose: () => void;
}

interface GnbBaseProps {
  /** 읽지 않은 알림이 있는지 여부. `true`면 알림 아이콘에 점(dot)을 표시한다. 기본값 `false`. */
  hasUnreadNotification?: boolean;
  /** 비로그인 상태에서 "로그인" 버튼이 이동할 경로. 생략 시 `GNB_DEFAULT_LOGIN_HREF`를 쓴다. */
  loginHref?: string;
  /** 알림 아이콘 클릭 시 호출되는 콜백. GNB는 실제 알림 이동/조회 로직을 갖지 않는다(공통 컴포넌트 원칙). */
  onNotificationClick?: () => void;
  /** 최상위 `<header>`에 추가로 합칠 className. */
  className?: string;
}

/**
 * `Gnb` 컴포넌트의 props. 로그인 여부에 따라 필요한 필드가 달라지는 discriminated union이다.
 *
 * - `isAuthenticated`가 없거나 `false`면 비회원/게스트 GNB(로그인 버튼, 게스트 메뉴)를 그린다.
 * - `isAuthenticated`가 `true`면 `user`가 반드시 필요하고, 알림/프로필 드롭다운/역할별 메뉴를 그린다.
 *   프로필 드롭다운의 "로그아웃" 항목을 눌렀을 때 `onLogout`이 있으면 호출한다. GNB는 실제 로그아웃
 *   API 연동을 갖지 않으므로(공통 컴포넌트 원칙) 생략 시 드롭다운만 닫히고 별도 동작은 없다.
 */
export type GnbProps =
  | (GnbBaseProps & { isAuthenticated?: false })
  | (GnbBaseProps & { isAuthenticated: true; user: GnbAuthenticatedUser; onLogout?: () => void });
