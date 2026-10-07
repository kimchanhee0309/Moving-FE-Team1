import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useEffect, useRef } from "react";

import type { GnbMobileMenuProps } from "./gnb.types";
import { useGnbLabel } from "./useGnbLabel";

const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

export function GnbMobileMenu({
  menuId,
  navItems,
  isAuthenticated,
  isAuthLoading,
  loginHref,
  firstNavLinkRef,
  onNavigate,
  onClose,
}: GnbMobileMenuProps) {
  const t = useTranslations("Common");
  const navLabel = useGnbLabel();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

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
    <div id={menuId} className="fixed inset-0 min-[1200px]:hidden">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-(--black-500)/50"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("fullMenu")}
        className="absolute inset-y-0 right-0 flex w-55 max-w-[85vw] flex-col overflow-y-auto bg-(--gray-50)"
      >
        <header className="flex h-13.5 shrink-0 items-center justify-end border-b border-(--line-100) px-4">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("closeMenu")}
            className={`inline-flex size-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0 ${FOCUS_RING}`}
          >
            <Image src="/images/gnb/icon-x.svg" alt="" width={24} height={24} className="size-6" />
          </button>
        </header>

        <nav className="flex flex-col">
          <ul className="m-0 flex list-none flex-col p-0">
            {navItems.map((item, index) => (
              <li key={item.href}>
                <Link
                  ref={index === 0 ? firstNavLinkRef : undefined}
                  href={item.href}
                  onClick={onNavigate}
                  className={`text-lg-medium block px-5 py-6 text-(--black-500)! no-underline hover:bg-(--background-200) ${FOCUS_RING}`}
                >
                  {navLabel(item.label)}
                </Link>
              </li>
            ))}
          </ul>

          {isAuthLoading ? (
            <div role="status" aria-label={t("checkingLogin")} className="px-5 py-6">
              <div aria-hidden="true" className="h-12 animate-pulse rounded-xl bg-(--gray-100)" />
            </div>
          ) : !isAuthenticated ? (
            <div className="px-5 py-6">
              <Link
                href={loginHref}
                onClick={onNavigate}
                className={`text-lg-semibold block rounded-xl bg-(--primary-400) px-4 py-3.5 text-center text-(--gray-50)! no-underline hover:bg-(--primary-500) ${FOCUS_RING}`}
              >
                {t("login")}
              </Link>
            </div>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
