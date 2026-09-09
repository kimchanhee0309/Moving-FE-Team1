"use client";

import Link from "next/link";

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
 * 리뷰 목록 라우트 내비게이션입니다.
 * 경로가 다른 페이지로 이동하므로 tablist가 아니라 nav + aria-current를 사용합니다.
 */
export function ReviewTabs({ value }: ReviewTabsProps) {
  return (
    <nav
      aria-label="리뷰 목록"
      className={[
        "w-full border-b border-[var(--line-100)] bg-[var(--gray-50)]",
        "px-6",
        "min-[744px]:px-[72px] min-[744px]:shadow-[0_2px_5px_rgba(248,248,248,0.2)]",
        // 세로 여백·그림자는 GNB PC(lg), 가로는 Figma Desktop(1200)
        "lg:pt-4 lg:shadow-[0_2px_5px_rgba(248,248,248,0.1)]",
        "min-[1200px]:px-[clamp(72px,18.75vw,360px)]",
      ].join(" ")}
    >
      <div className="flex items-center gap-6 lg:gap-8">
        {ITEMS.map((item) => {
          const isSelected = item.id === value;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isSelected ? "page" : undefined}
              className={getTabClassName(isSelected)}
            >
              <span className={getTabLabelClassName(isSelected)}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
