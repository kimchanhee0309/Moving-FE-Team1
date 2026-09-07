"use client";

import Link from "next/link";
import type { KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";

import type { DropdownSize } from "./dropdown.types";
import { useDropdown } from "./useDropdown";

export interface ProfileDropdownItem {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  variant?: "default" | "label" | "logout";
}

export type ProfileDropdownAction = Pick<
  ProfileDropdownItem,
  "disabled" | "href" | "onSelect"
>;

export interface ProfileDropdownProps {
  trigger: ReactNode;
  triggerAriaLabel: string;
  items: readonly ProfileDropdownItem[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  size?: DropdownSize;
  disabled?: boolean;
  menuLabel?: string;
  profileType?: "generic" | "customer" | "mover";
  align?: "left" | "right";
  className?: string;
}

/**
 * GNB 아바타에 연결하는 고객/기사님 공용 프로필 메뉴다.
 * 메뉴 이름과 이동 경로를 외부에서 받아 유저 타입별 권한과 라우트를 소유하지 않는다.
 */
export function ProfileDropdown({
  trigger,
  triggerAriaLabel,
  items,
  isOpen,
  onOpenChange,
  size = "sm",
  disabled = false,
  menuLabel = "프로필 메뉴",
  profileType = "generic",
  align = "right",
  className,
}: ProfileDropdownProps) {
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>(
    [],
  );
  const { closeAndRestoreFocus, menuId, rootRef, toggle, triggerRef } =
    useDropdown({ isOpen, onOpenChange, disabled });

  const handleSelect = (item: ProfileDropdownItem) => {
    item.onSelect?.();
    closeAndRestoreFocus();
  };

  const focusItem = (startIndex: number, direction: 1 | -1) => {
    let nextIndex = startIndex;

    for (let count = 0; count < items.length; count += 1) {
      nextIndex = (nextIndex + direction + items.length) % items.length;

      if (
        !items[nextIndex]?.disabled &&
        items[nextIndex]?.variant !== "label"
      ) {
        itemRefs.current[nextIndex]?.focus();
        return;
      }
    }
  };

  const handleItemKeyDown = (
    event: KeyboardEvent<HTMLAnchorElement | HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(index, 1);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(index, -1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      focusItem(-1, 1);
    }

    if (event.key === "End") {
      event.preventDefault();
      focusItem(0, -1);
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      onOpenChange(true);
      requestAnimationFrame(() => focusItem(-1, 1));
    }
  };

  const usesRoleLayout = profileType !== "generic";
  const itemClassName = [
    "flex w-full items-center rounded-lg text-left !text-[var(--black-400)] outline-none transition-colors",
    "hover:!bg-[var(--gray-100)] focus-visible:!bg-[var(--gray-100)]",
    "aria-disabled:pointer-events-none aria-disabled:!text-[var(--gray-400)]",
    usesRoleLayout
      ? size === "sm"
        ? "text-md-medium h-full !px-3 !py-0"
        : "text-lg-medium h-full !px-6 !py-0"
      : size === "sm"
        ? "text-md-medium min-h-10 !px-3 !py-2"
        : "text-lg-medium min-h-[50px] !px-6 !py-3",
  ].join(" ");

  const roleMenuSizeClassName =
    profileType === "customer"
      ? size === "sm"
        ? "h-[208px] w-[140px]"
        : "h-[272px] w-60"
      : profileType === "mover"
        ? size === "sm"
          ? "h-[120px] w-[140px]"
          : "h-[154px] w-60"
        : "";

  return (
    <div
      className={["relative inline-flex", className].filter(Boolean).join(" ")}
      ref={rootRef}
    >
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={triggerAriaLabel}
        className="rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-300)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={disabled}
        onClick={toggle}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        {trigger}
      </button>

      {isOpen && !disabled ? (
        <div
          aria-label={menuLabel}
          className={[
            "absolute top-full z-30 mt-2 flex flex-col border border-[var(--line-200)] bg-[var(--gray-50)] shadow-[2px_2px_8px_rgba(224,224,224,0.2)]",
            align === "right" ? "right-0" : "left-0",
            size === "sm"
              ? "rounded-2xl px-1.5 pb-1.5 pt-2.5"
              : "rounded-2xl px-1 pb-1.5 pt-4",
            usesRoleLayout
              ? roleMenuSizeClassName
              : size === "sm"
                ? "w-[140px]"
                : "w-60",
          ].join(" ")}
          id={menuId}
          role="menu"
        >
          {items.map((item, index) => (
            <div
              className={
                [
                  usesRoleLayout ? "flex min-h-0 flex-1 items-stretch" : "",
                  item.variant === "logout"
                    ? "border-t border-[var(--line-200)]"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
              key={item.id}
              role="none"
            >
              {item.variant === "label" ? (
                <p
                  className={[
                    "flex w-full items-center !text-[var(--black-500)]",
                    usesRoleLayout
                      ? size === "sm"
                        ? "text-md-semibold h-full px-3 py-0"
                        : "text-lg-semibold h-full px-6 py-0"
                      : size === "sm"
                        ? "text-md-semibold min-h-10 px-3 py-2"
                        : "text-lg-semibold min-h-[50px] px-6 py-3",
                  ].join(" ")}
                  role="presentation"
                >
                  {item.label}
                </p>
              ) : item.href && !item.disabled ? (
                <Link
                  className={itemClassName}
                  href={item.href}
                  onClick={() => handleSelect(item)}
                  onKeyDown={(event) => handleItemKeyDown(event, index)}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  aria-disabled={item.disabled}
                  className={itemClassName}
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                  onKeyDown={(event) => handleItemKeyDown(event, index)}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  role="menuitem"
                  type="button"
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
