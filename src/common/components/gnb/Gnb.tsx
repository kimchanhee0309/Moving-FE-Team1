"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { ROUTES } from "@/common/constants/routes";

import { GnbMobileMenu } from "./GnbMobileMenu";
import { GnbNotificationMenu } from "./GnbNotificationMenu";
import { GnbProfileMenu } from "./GnbProfileMenu";
import {
  GNB_DEFAULT_LOGIN_HREF,
  GNB_GUEST_NAV_ITEMS,
  GNB_NAV_ITEMS_BY_ROLE,
  GNB_PROFILE_MENU_ITEMS_BY_ROLE,
} from "./gnb.constants";
import type { GnbProps } from "./gnb.types";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)";

export function Gnb(props: GnbProps) {
  const {
    hasUnreadNotification = false,
    notificationItems = [],
    onNotificationClick,
    onNotificationsRead,
    className,
  } = props;
  const loginHref = props.loginHref ?? GNB_DEFAULT_LOGIN_HREF;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);
  const menuId = useId();
  const profileMenuId = useId();
  const notificationMenuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileNavLinkRef = useRef<HTMLAnchorElement>(null);
  const firstProfileMenuItemRef = useRef<HTMLAnchorElement>(null);
  const notificationCloseButtonRef = useRef<HTMLButtonElement>(null);

  // 로그인 여부에 따라 좁혀진 값을 미리 뽑아 두면, 아래 JSX/handler에서 `props.isAuthenticated`
  // discriminated union을 매번 다시 좁히지 않고도 안전하게 재사용할 수 있다.
  const authenticatedUser = props.isAuthenticated ? props.user : null;
  const onLogout = props.isAuthenticated ? props.onLogout : undefined;

  const navItems = authenticatedUser
    ? GNB_NAV_ITEMS_BY_ROLE[authenticatedUser.role]
    : GNB_GUEST_NAV_ITEMS;
  const profileMenuItems = authenticatedUser
    ? GNB_PROFILE_MENU_ITEMS_BY_ROLE[authenticatedUser.role]
    : [];

  const handleCloseMenu = () => setIsMenuOpen(false);
  const handleDismissMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  };
  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setIsProfileMenuOpen(false);
    setIsNotificationMenuOpen(false);
  };

  const handleCloseProfileMenu = () => setIsProfileMenuOpen(false);
  const handleDismissProfileMenu = () => {
    setIsProfileMenuOpen(false);
    profileButtonRef.current?.focus();
  };
  const handleToggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
    setIsMenuOpen(false);
    setIsNotificationMenuOpen(false);
  };
  const handleLogoutClick = () => {
    handleDismissProfileMenu();
    onLogout?.();
  };

  const handleCloseNotificationMenu = () => setIsNotificationMenuOpen(false);
  const handleDismissNotificationMenu = () => {
    setIsNotificationMenuOpen(false);
    notificationButtonRef.current?.focus();
  };
  const handleToggleNotificationMenu = () => {
    setIsNotificationMenuOpen((prev) => {
      const next = !prev;
      if (next) {
        onNotificationClick?.();
      }
      return next;
    });
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      firstMobileNavLinkRef.current?.focus();
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isProfileMenuOpen) {
      firstProfileMenuItemRef.current?.focus();
    }
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (isNotificationMenuOpen) {
      notificationCloseButtonRef.current?.focus();
    }
  }, [isNotificationMenuOpen]);

  // 알림 드롭다운이 "열림 -> 닫힘"으로 바뀌는 시점에만 onNotificationsRead를 호출한다. Esc/바깥클릭/X버튼/
  // 벨 재클릭/항목 클릭 이동 등 닫히는 경로가 여러 곳이라, 각 핸들러에 흩어 놓지 않고 이전 값을 ref로 들고
  // 있다가 "직전엔 열려 있었는데 지금은 닫힘"인 전환만 감지한다(effect cleanup은 open->true 전환에서도
  // 실행되어 버려서 이 용도로는 쓸 수 없다).
  const wasNotificationMenuOpenRef = useRef(false);
  useEffect(() => {
    if (wasNotificationMenuOpenRef.current && !isNotificationMenuOpen) {
      onNotificationsRead?.();
    }
    wasNotificationMenuOpenRef.current = isNotificationMenuOpen;
  }, [isNotificationMenuOpen, onNotificationsRead]);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleDismissMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isProfileMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleDismissProfileMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (!isNotificationMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleDismissNotificationMenu();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isNotificationMenuOpen]);

  return (
    <header
      className={
        className
          ? `relative w-full border-b border-(--line-100) bg-(--gray-50) ${className}`
          : "relative w-full border-b border-(--line-100) bg-(--gray-50)"
      }
    >
      <div className="mx-auto flex h-13.5 max-w-[1920px] items-center justify-between gap-4 px-6 md:px-10 lg:h-22 lg:gap-8 lg:px-40">
        <div className="flex items-center lg:gap-20">
          <Link
            href={ROUTES.HOME}
            onClick={handleCloseMenu}
            aria-label="무빙 홈으로 이동"
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg ${FOCUS_RING}`}
          >
            <Image
              src="/images/gnb/logo-icon.svg"
              alt=""
              width={44}
              height={44}
              className="size-8 lg:size-11"
            />
            <Image
              src="/images/gnb/logo-wordmark.svg"
              alt="무빙"
              width={66}
              height={34}
              className={
                props.isAuthenticated
                  ? "hidden h-6.5 w-auto lg:block lg:h-8.5"
                  : "block h-6.5 w-auto lg:h-8.5"
              }
            />
          </Link>

          <nav aria-label="주요 메뉴" className="hidden lg:block">
            <ul className="flex list-none items-center gap-10 m-0 p-0">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-2lg-bold inline-flex h-22 items-center justify-center whitespace-nowrap py-4 text-(--black-500) no-underline hover:text-(--primary-400) ${FOCUS_RING}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-6 lg:gap-8">
          {authenticatedUser && (
            <>
              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  type="button"
                  onClick={handleToggleNotificationMenu}
                  aria-haspopup="menu"
                  aria-expanded={isNotificationMenuOpen}
                  aria-controls={notificationMenuId}
                  aria-label={
                    hasUnreadNotification
                      ? `새 알림이 있습니다. 알림 ${isNotificationMenuOpen ? "닫기" : "열기"}`
                      : `알림 ${isNotificationMenuOpen ? "닫기" : "열기"}`
                  }
                  className={`relative inline-flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 lg:size-9 ${FOCUS_RING} focus-visible:rounded-full`}
                >
                  <Image
                    src="/images/gnb/icon-alarm.svg"
                    alt=""
                    width={36}
                    height={36}
                    className="size-6 lg:size-9"
                  />
                  {hasUnreadNotification && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-px -right-px size-2 rounded-full border-[1.5px] border-(--gray-50) bg-(--primary-400)"
                    />
                  )}
                </button>

                {isNotificationMenuOpen && (
                  <GnbNotificationMenu
                    menuId={notificationMenuId}
                    items={notificationItems}
                    closeButtonRef={notificationCloseButtonRef}
                    triggerRef={notificationButtonRef}
                    onNavigate={handleCloseNotificationMenu}
                    onClose={handleDismissNotificationMenu}
                  />
                )}
              </div>

              <div className="relative">
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={handleToggleProfileMenu}
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-controls={profileMenuId}
                  aria-label={`${authenticatedUser.name} 계정 메뉴 ${isProfileMenuOpen ? "닫기" : "열기"}`}
                  className={`inline-flex cursor-pointer items-center gap-4 rounded-lg border-0 bg-transparent p-0 text-(--black-500) ${FOCUS_RING}`}
                >
                  <Image
                    src="/images/gnb/icon-profile-default.svg"
                    alt=""
                    width={36}
                    height={36}
                    className="size-6 rounded-full lg:size-9"
                  />
                  <span className="text-2lg-medium hidden whitespace-nowrap lg:inline">
                    {authenticatedUser.name}
                  </span>
                </button>

                {isProfileMenuOpen && (
                  <GnbProfileMenu
                    menuId={profileMenuId}
                    role={authenticatedUser.role}
                    userName={authenticatedUser.name}
                    items={profileMenuItems}
                    firstItemRef={firstProfileMenuItemRef}
                    triggerRef={profileButtonRef}
                    onNavigate={handleCloseProfileMenu}
                    onLogout={handleLogoutClick}
                    onClose={handleDismissProfileMenu}
                  />
                )}
              </div>
            </>
          )}

          {!props.isAuthenticated && (
            <Link
              href={loginHref}
              className={`text-2lg-semibold hidden h-11 w-29 items-center justify-center rounded-xl bg-(--primary-400) p-4 text-(--gray-50) no-underline hover:bg-(--primary-500) lg:inline-flex ${FOCUS_RING}`}
            >
              로그인
            </Link>
          )}

          <button
            ref={menuButtonRef}
            type="button"
            onClick={handleToggleMenu}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            className={`inline-flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 lg:hidden ${FOCUS_RING}`}
          >
            <Image
              src="/images/gnb/icon-menu.svg"
              alt=""
              width={16}
              height={12}
              className="block h-3 w-4"
            />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <GnbMobileMenu
          menuId={menuId}
          navItems={navItems}
          isAuthenticated={!!props.isAuthenticated}
          loginHref={loginHref}
          firstNavLinkRef={firstMobileNavLinkRef}
          onNavigate={handleCloseMenu}
          onClose={handleDismissMenu}
        />
      )}
    </header>
  );
}
