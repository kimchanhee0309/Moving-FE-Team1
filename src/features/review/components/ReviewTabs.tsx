"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, type KeyboardEvent } from "react";

import { ROUTES } from "@/common/constants/routes";

type ReviewTabValue = "writable" | "written";

interface ReviewTabItem {
  id: ReviewTabValue;
  label: string;
  href: string;
}

interface ReviewTabsProps {
  value: ReviewTabValue;
}

const ITEMS: ReviewTabItem[] = [
  {
    id: "writable",
    label: "작성 가능한 리뷰",
    href: ROUTES.CUSTOMER.REVIEW.CREATE,
  },
  {
    id: "written",
    label: "내가 작성한 리뷰",
    href: ROUTES.CUSTOMER.REVIEW.WRITTEN,
  },
];

function getTabClassName(isSelected: boolean) {
  return [
    "relative shrink-0 cursor-pointer whitespace-nowrap transition-colors",
    // Mobile/Tablet: py 15 + lh 24 ≈ 54. PC는 GNB와 같이 lg(1024)
    "py-[15px] lg:py-4",
    isSelected
      ? "border-b-2 border-[var(--black-400)] text-[var(--black-500)] lg:border-[var(--black-500)]"
      : [
          "border-b-2 border-transparent text-[var(--gray-400)]",
          "hover:text-[var(--black-300)]",
        ].join(" "),
  ].join(" ");
}

function getTabLabelClassName(isSelected: boolean) {
  // typography.css 클래스명은 lg: 반응형이 안 먹혀 Figma 수치를 직접 지정합니다.
  // Mobile/Tablet 14/24 · PC(lg) 20/32
  return isSelected
    ? "text-[14px] leading-6 font-bold lg:text-[20px] lg:leading-8 lg:font-semibold"
    : "text-[14px] leading-6 font-semibold lg:text-[20px] lg:leading-8 lg:font-semibold";
}

/**
 * 리뷰 전용 탭입니다.
 * 공통 Tabs는 건드리지 않고, 리뷰 Figma·GNB(lg) 타이밍만 여기서 맞춥니다.
 */
export function ReviewTabs({ value }: ReviewTabsProps) {
  const router = useRouter();
  const tabRefs = useRef<Map<ReviewTabValue, HTMLAnchorElement>>(new Map());

  const selectTab = (item: ReviewTabItem) => {
    tabRefs.current.get(item.id)?.focus();
    router.push(item.href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();
    const currentIndex = ITEMS.findIndex((item) => item.id === value);
    const fallbackIndex = currentIndex < 0 ? 0 : currentIndex;
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextItem = ITEMS[(fallbackIndex + delta + ITEMS.length) % ITEMS.length];

    if (nextItem) {
      selectTab(nextItem);
    }
  };

  return (
    <div
      className={[
        "w-full border-b border-[var(--line-100)] bg-[var(--gray-50)]",
        "px-6",
        "min-[744px]:px-[72px] min-[744px]:shadow-[0_2px_5px_rgba(248,248,248,0.2)]",
        // 세로 여백·그림자는 GNB PC(lg), 가로는 Figma Desktop(1200)
        "lg:pt-4 lg:shadow-[0_2px_5px_rgba(248,248,248,0.1)]",
        "min-[1200px]:px-[clamp(72px,18.75vw,360px)]",
      ].join(" ")}
    >
      <div
        role="tablist"
        aria-label="리뷰 목록"
        className="flex items-center gap-6 lg:gap-8"
        onKeyDown={handleKeyDown}
      >
        {ITEMS.map((item) => {
          const isSelected = item.id === value;

          return (
            <Link
              key={item.id}
              href={item.href}
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              ref={(element) => {
                if (element) {
                  tabRefs.current.set(item.id, element);
                  return;
                }
                tabRefs.current.delete(item.id);
              }}
              className={getTabClassName(isSelected)}
            >
              <span className={getTabLabelClassName(isSelected)}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
