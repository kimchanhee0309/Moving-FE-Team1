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

/**
 * `GnbNotificationMenu` 안의 알림 한 줄 문구를 구성하는 조각.
 * Figma 알림 드롭다운은 문장 일부(예: "소형이사 견적", "확정", 이사 경로)만 강조색(주황)으로 표시하므로,
 * 문자열 전체가 아니라 조각 배열로 받아 어떤 부분을 강조할지 호출부가 그대로 지정하게 한다.
 */
export interface GnbNotificationSegment {
  /** 이 조각에 보여줄 텍스트. */
  text: string;
  /** `true`면 강조색(`--primary-400`)으로 표시한다. Figma의 주황색 강조 텍스트에 대응한다. */
  emphasis?: boolean;
}

/**
 * `GnbNotificationMenu`가 보여줄 알림 한 건.
 *
 * Notification API가 아직 확정되지 않았으므로(AGENTS.md 11번, "Notification: 문서화된 endpoint가 없음")
 * 이 타입은 백엔드 DTO를 추측해 정의하지 않고, 화면 표시에 필요한 최소 필드만 가진 순수 표시용 타입이다.
 * customer의 "새 견적/견적 확정/이사 당일", mover의 "새 요청/견적 확정/이사 당일"(AGENTS.md 12번) 같은
 * 알림 종류 구분은 이 타입이 아니라 `segments` 조합으로 호출부가 표현한다.
 */
export interface GnbNotificationItem {
  /** 알림 고유 id. list key로 사용한다. */
  id: string;
  /** 알림 문구를 구성하는 조각 목록. 순서대로 이어 붙여 한 문장으로 렌더링한다. */
  segments: GnbNotificationSegment[];
  /** "2시간 전"처럼 화면에 그대로 보여줄, 이미 포맷된 상대 시간 문자열. 포맷 로직은 이 컴포넌트가 갖지 않는다. */
  timeAgo: string;
  /**
   * 알림을 클릭했을 때 이동할 경로. 이동 대상 계약(예: 견적 상세 URL 규칙)이 아직 확정되지 않았다면
   * 생략한다. 생략 시 이 알림은 클릭할 수 없는 정적 텍스트 행으로 렌더링된다.
   */
  href?: string;
  /**
   * 이미 읽은 알림이면 `true`. `true`면 화면에서 흐리게(muted) 표시한다. DB의 실제 필드명(`readAt` 등)이
   * 아직 확정되지 않았으므로, 이 값은 원본 필드 그대로가 아니라 호출부(로직 구현 단계의 mapper)가
   * `isRead: readAt != null` 같은 형태로 미리 변환해서 넘겨준다고 가정한다.
   */
  isRead?: boolean;
}

/**
 * `GnbNotificationMenu`(GNB 알림 벨을 클릭하면 트리거 바로 아래에 나타나는 anchored 드롭다운)의 props.
 * `GnbProfileMenu`와 동일하게 `Gnb`가 열림 상태를 소유하는 controlled 컴포넌트이며, 열려 있을 때만
 * 부모에 의해 마운트된다. `Gnb` 내부에서만 사용하는 컴포넌트이므로 barrel(`index.ts`)에는 export하지 않는다.
 */
export interface GnbNotificationMenuProps {
  /** 드롭다운 패널의 DOM id. 알림 벨 버튼의 `aria-controls`와 짝을 이룬다. */
  menuId: string;
  /** 보여줄 알림 목록. 빈 배열이면 빈 상태 문구를 보여준다. */
  items: GnbNotificationItem[];
  /**
   * 패널 안의 닫기(X) 버튼 ref. 패널이 열릴 때 포커스를 옮길 첫 번째(유일하게 보장된) 포커스 대상이다.
   * 알림 항목은 `href`가 있을 때만 포커스 가능한 링크가 되므로, 항상 존재하는 이 버튼을 기준으로 삼는다.
   */
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  /**
   * 트리거(알림 벨) 버튼의 ref. 바깥 클릭 감지 시 트리거 자신을 클릭한 것까지
   * "메뉴 바깥 클릭"으로 오인해 토글이 즉시 재닫힘되는 것을 막기 위해 필요하다.
   */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** `href`가 있는 알림 항목을 클릭해 실제로 다른 화면으로 이동하면서 드롭다운을 닫을 때 호출하는 콜백. */
  onNavigate: () => void;
  /**
   * 화면 이동 없이 드롭다운만 닫을 때(패널 안의 닫기(X) 버튼, Esc, 바깥 클릭) 호출하는 콜백.
   * 부모가 이 콜백 안에서 트리거(알림 벨) 버튼으로 포커스를 복귀시킨다.
   */
  onClose: () => void;
}

interface GnbBaseProps {
  /** 읽지 않은 알림이 있는지 여부. `true`면 알림 아이콘에 점(dot)을 표시한다. 기본값 `false`. */
  hasUnreadNotification?: boolean;
  /**
   * 알림 드롭다운(`GnbNotificationMenu`)에 보여줄 알림 목록. 생략하거나 빈 배열이면 빈 상태 문구를 보여준다.
   * Notification API가 아직 확정되지 않았으므로(AGENTS.md 11번) `Gnb`는 이 목록을 그대로 그리기만 하고
   * 조회/새로고침 로직을 갖지 않는다(공통 컴포넌트 원칙).
   */
  notificationItems?: GnbNotificationItem[];
  /** 비로그인 상태에서 "로그인" 버튼이 이동할 경로. 생략 시 `GNB_DEFAULT_LOGIN_HREF`를 쓴다. */
  loginHref?: string;
  /**
   * 알림 드롭다운이 열릴 때(닫힐 때는 호출하지 않음) 함께 호출되는 콜백. GNB는 실제 알림 조회/새로고침
   * 로직을 갖지 않으므로(공통 컴포넌트 원칙), 호출부가 이 콜백에서 최신 알림을 불러오는 용도로 쓸 수 있다.
   */
  onNotificationClick?: () => void;
  /**
   * 알림 드롭다운이 **닫힐 때**(Esc, 바깥 클릭, 닫기(X) 버튼, 벨 재클릭, 항목 클릭으로 인한 이동 등
   * 어떤 방식으로 닫히든 전부 포함) 호출되는 콜백. "사용자가 열어서 다 보고 닫았다"는 시점이라, 호출부가
   * 여기서 읽음 처리 mutation을 트리거하는 용도로 쓸 수 있다. GNB는 실제 읽음 처리 API를 갖지 않는다
   * (공통 컴포넌트 원칙) — `onNotificationClick`(열 때, 조회용)과는 트리거 시점이 다르다.
   */
  onNotificationsRead?: () => void;
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
