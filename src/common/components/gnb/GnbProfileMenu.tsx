"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { GNB_PROFILE_GREETING_SUFFIX_BY_ROLE } from "./gnb.constants";
import type { GnbProfileMenuProps } from "./gnb.types";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

/**
 * 프로필 드롭다운의 치수/타이포그래피는 role(customer/mover)이 아니라 **화면 폭**에 따라 달라진다.
 * Figma 컴포넌트의 `property2` variant는 "sm"(태블릿/모바일, 140px 폭)과 "md"(PC, 240px 폭)이며,
 * 이 저장소의 다른 GNB 반응형 기준과 맞춰 `lg`(1024px) 미만은 sm, 이상은 md 스타일을 쓴다.
 *
 * 색상은 `src/styles/colors.css` 토큰을 사용한다. Figma 변수 값과 완전히 일치하지 않는 항목은
 * 가장 가까운 기존 토큰을 사용했다(세부 내용은 컴포넌트 작업 보고 참고):
 * - Figma `black/black-400`(#262524) → 저장소 `--black-400`(#1e1e1e)로 근사
 * - Figma `gray/gray-500`(#808080) → 저장소 `--gray-500`(#7a7a79)로 근사
 */
const PROFILE_MENU_SIZE = {
  /** 드롭다운 전체(카드) 안쪽 여백. sm(기본) → md(`lg:`) */
  containerPadding: "pt-2.5 pb-1.5 px-1.5 lg:pt-4 lg:pb-1.5 lg:px-1",
  /** 각 행(항목)의 고정 너비. sm 140px → md(`lg:`) 240px */
  rowWidth: "w-[140px] lg:w-60",
  /** 상단 인사말 행의 안쪽 여백. */
  headerPadding: "px-3 py-2 lg:pl-6 lg:pr-3 lg:py-3.5",
  /** 로그아웃을 제외한 이동형 항목의 기본 안쪽 여백. */
  itemPadding: "px-3 py-2 lg:pl-6 lg:pr-3 lg:py-3.5",
  /** 로그아웃 바로 위, 마지막 이동형 항목의 안쪽 여백(sm 디자인은 구분선 위 여백이 더 크다). */
  lastItemPadding: "px-3 pt-2 pb-4 lg:pl-6 lg:pr-3 lg:py-3.5",
  /** 로그아웃 행의 안쪽 여백. */
  logoutPadding: "px-3 pt-3 pb-2 lg:pt-3.5",
  /** 상단 인사말 타이포그래피/색상. */
  headerText: "text-lg-bold text-(--black-400) lg:text-2lg-bold lg:text-(--black-300)",
  /** 이동형 항목 타이포그래피/색상. */
  itemText: "text-md-medium text-(--black-400) lg:text-lg-medium",
  /** 로그아웃 타이포그래피/색상. */
  logoutText: "text-xs-regular text-(--gray-500) lg:text-md-medium",
};

/**
 * GNB 아바타(프로필 트리거)를 클릭하면 트리거 바로 아래에 나타나는 anchored 드롭다운.
 *
 * `Gnb`가 열림 상태를 소유하는 controlled 컴포넌트이며, 열려 있을 때만 부모에 의해 마운트된다.
 * role(customer/mover)에 따라 상단 인사말 접미사와 항목 구성이 달라지고, 치수/타이포그래피는
 * role과 무관하게 화면 폭(`lg` 기준 PC vs 태블릿/모바일)에 따라 달라진다({@link PROFILE_MENU_SIZE} 참고).
 */
export function GnbProfileMenu({
  menuId,
  role,
  userName,
  items,
  firstItemRef,
  triggerRef,
  onNavigate,
  onLogout,
  onClose,
}: GnbProfileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const greetingSuffix = GNB_PROFILE_GREETING_SUFFIX_BY_ROLE[role];

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }

      onClose();
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [onClose, triggerRef]);

  useEffect(() => {
    function handleTabKey(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, []);

  return (
    <div
      ref={panelRef}
      id={menuId}
      role="menu"
      aria-label="계정 메뉴"
      className={`absolute top-full right-0 z-10 mt-2 flex flex-col items-start rounded-2xl border border-(--line-200) bg-(--gray-50) shadow-[2px_2px_4px_rgba(224,224,224,0.2)] ${PROFILE_MENU_SIZE.containerPadding}`}
    >
      <div role="none" className={`${PROFILE_MENU_SIZE.rowWidth} ${PROFILE_MENU_SIZE.headerPadding}`}>
        <p className={`m-0 truncate ${PROFILE_MENU_SIZE.headerText}`}>
          {userName}
          {greetingSuffix}
        </p>
      </div>

      {items.map((item, index) => {
        const isLastItem = index === items.length - 1;

        return (
          <Link
            key={item.href}
            ref={index === 0 ? firstItemRef : undefined}
            href={item.href}
            role="menuitem"
            onClick={onNavigate}
            className={`block whitespace-nowrap no-underline hover:bg-(--background-200) ${PROFILE_MENU_SIZE.rowWidth} ${isLastItem ? PROFILE_MENU_SIZE.lastItemPadding : PROFILE_MENU_SIZE.itemPadding} ${PROFILE_MENU_SIZE.itemText} ${FOCUS_RING}`}
          >
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        role="menuitem"
        onClick={onLogout}
        className={`flex cursor-pointer items-center justify-center border-0 border-t border-(--line-100) text-center hover:bg-(--background-200)! ${PROFILE_MENU_SIZE.rowWidth} ${PROFILE_MENU_SIZE.logoutPadding} ${PROFILE_MENU_SIZE.logoutText} ${FOCUS_RING}`}
      >
        로그아웃
      </button>
    </div>
  );
}
