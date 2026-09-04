"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { ROUTES } from "@/common/constants/routes";

import { GnbMobileMenu } from "./GnbMobileMenu";
import {
  GNB_DEFAULT_LOGIN_HREF,
  GNB_GUEST_NAV_ITEMS,
  GNB_NAV_ITEMS_BY_ROLE,
} from "./gnb.constants";
import type { GnbProps } from "./gnb.types";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)";

export function Gnb(props: GnbProps) {
  const { hasUnreadNotification = false, onNotificationClick, className } = props;
  const loginHref = props.loginHref ?? GNB_DEFAULT_LOGIN_HREF;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMobileNavLinkRef = useRef<HTMLAnchorElement>(null);

  const navItems = props.isAuthenticated
    ? GNB_NAV_ITEMS_BY_ROLE[props.user.role]
    : GNB_GUEST_NAV_ITEMS;

  const handleCloseMenu = () => setIsMenuOpen(false);
  const handleDismissMenu = () => {
    setIsMenuOpen(false);
    menuButtonRef.current?.focus();
  };
  const handleToggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    if (isMenuOpen) {
      firstMobileNavLinkRef.current?.focus();
    }
  }, [isMenuOpen]);

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
          {props.isAuthenticated && (
            <>
              <button
                type="button"
                onClick={onNotificationClick}
                aria-label={hasUnreadNotification ? "새 알림이 있습니다" : "알림"}
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

              <Link
                href={props.user.profileHref}
                className={`inline-flex items-center gap-4 rounded-lg text-(--black-500) no-underline ${FOCUS_RING}`}
              >
                <Image
                  src="/images/gnb/icon-profile-default.svg"
                  alt=""
                  width={36}
                  height={36}
                  className="size-6 rounded-full lg:size-9"
                />
                <span className="text-2lg-medium hidden whitespace-nowrap lg:inline">
                  {props.user.name}
                </span>
              </Link>
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
