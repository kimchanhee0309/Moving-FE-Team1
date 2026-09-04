/* 사용법 예시
<Tabs
  ariaLabel="견적 목록"
  value="pending"
  items={[
    { id: "pending", label: "대기 중인 견적", href: ROUTES.CUSTOMER.QUOTE.PENDING },
    { id: "history", label: "받았던 견적", href: ROUTES.CUSTOMER.QUOTE.HISTORY },
  ]}
/>
 */

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { KeyboardEvent } from "react";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  href?: string;
}

export interface TabsProps<T extends string = string> {
  items: TabItem<T>[];
  value: T;
  onChange?: (id: T) => void;
  className?: string;
  ariaLabel?: string;
}

function getTabClassName(isSelected: boolean) {
  return [
    "relative shrink-0 whitespace-nowrap",
    "h-[54px] min-[1200px]:h-auto min-[1200px]:py-4",
    isSelected
      ? "border-b-2 border-[var(--black-400)] text-[var(--black-500)] min-[1200px]:border-[var(--black-500)]"
      : "border-b-2 border-transparent text-[var(--gray-400)]",
  ].join(" ");
}

function getTabLabelClassName(isSelected: boolean) {
  return isSelected
    ? "text-md-bold min-[1200px]:text-xl-semibold"
    : "text-md-semibold min-[1200px]:text-xl-semibold";
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  ariaLabel,
}: TabsProps<T>) {
  const router = useRouter();
  const tabRefs = useRef<Map<T, HTMLElement>>(new Map());

  const setTabRef = (id: T, element: HTMLElement | null) => {
    if (element) {
      tabRefs.current.set(id, element);
      return;
    }

    tabRefs.current.delete(id);
  };

  const selectTab = (item: TabItem<T>) => {
    onChange?.(item.id);
    tabRefs.current.get(item.id)?.focus();

    if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (items.length === 0) {
      return;
    }

    const currentIndex = items.findIndex((item) => item.id === value);
    const fallbackIndex = currentIndex < 0 ? 0 : currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex =
        (fallbackIndex + delta + items.length) % items.length;
      const nextItem = items[nextIndex];

      if (nextItem) {
        selectTab(nextItem);
      }
    }
  };

  return (
    <div
      className={[
        "w-full border-b border-[var(--line-100)] bg-[var(--gray-50)]",
        "px-6",
        "min-[744px]:px-[72px] min-[744px]:shadow-[0_2px_5px_rgba(248,248,248,0.2)]",
        "min-[1200px]:px-[clamp(72px,18.75vw,360px)] min-[1200px]:pt-4 min-[1200px]:shadow-[0_2px_5px_rgba(248,248,248,0.1)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        role="tablist"
        aria-label={ariaLabel}
        className="flex items-center gap-6 min-[1200px]:gap-8"
        onKeyDown={handleKeyDown}
      >
        {items.map((item) => {
          const isSelected = item.id === value;
          const label = (
            <span className={getTabLabelClassName(isSelected)}>
              {item.label}
            </span>
          );

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                role="tab"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                ref={(element) => {
                  setTabRef(item.id, element);
                }}
                onClick={() => {
                  onChange?.(item.id);
                }}
                className={getTabClassName(isSelected)}
              >
                {label}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              ref={(element) => {
                setTabRef(item.id, element);
              }}
              onClick={() => {
                onChange?.(item.id);
              }}
              className={getTabClassName(isSelected)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
