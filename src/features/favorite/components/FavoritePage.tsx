"use client";

import Link from "next/link";
import { useState } from "react";

import { MoverSearchCard } from "@/common/components/MoverSearch";
import { ROUTES } from "@/common/constants/routes";

import { MOCK_FAVORITE_MOVERS, type FavoriteMover } from "../favorite.mock";

const CHECKBOX_BOX_CLASS = [
  "pointer-events-none flex size-5 shrink-0 items-center justify-center rounded-[4px]",
  "border border-[var(--line-200)] bg-[var(--gray-50)]",
  "transition-colors",
  "peer-hover:border-[var(--primary-300)]",
  "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--black-400)]",
  "peer-disabled:opacity-50",
].join(" ");

function FavoriteCheckbox({
  checked,
  disabled,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  "aria-label": string;
}) {
  return (
    <span className="relative flex size-9 shrink-0 items-center justify-center">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel}
        className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
      <span
        className={[
          CHECKBOX_BOX_CLASS,
          checked
            ? "border-[var(--primary-400)]! bg-[var(--primary-400)]!"
            : "",
        ].join(" ")}
        aria-hidden="true"
      >
        {checked ? (
          <svg
            viewBox="0 0 12 12"
            className="size-3 text-[var(--gray-50)]"
            fill="none"
          >
            <path
              d="M2 6.2L4.8 9L10 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
    </span>
  );
}

export function FavoritePage() {
  const [movers, setMovers] = useState<FavoriteMover[]>(MOCK_FAVORITE_MOVERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const totalCount = movers.length;
  const selectedCount = selectedIds.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const hasSelection = selectedCount > 0;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(movers.map((mover) => mover.id));
  };

  const handleSelectChange = (moverId: string, isSelected: boolean) => {
    setSelectedIds((prev) => {
      if (isSelected) {
        if (prev.includes(moverId)) return prev;
        return [...prev, moverId];
      }
      return prev.filter((id) => id !== moverId);
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setMovers((prev) =>
      prev.filter((mover) => !selectedIds.includes(mover.id)),
    );
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-[var(--gray-50)] py-4 shadow-[0px_2px_10px_0px_rgba(248,248,248,0.1)] min-[744px]:py-5 min-[1200px]:py-8">
        <div className="mx-auto w-full max-w-[1200px] px-6 min-[744px]:px-[72px] min-[1200px]:px-2">
          <h1 className="text-2xl-semibold text-[var(--black-500)] max-[743px]:text-xl-bold">
            찜한 기사님
          </h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 pt-4 pb-10 min-[744px]:gap-7 min-[744px]:px-[72px] min-[744px]:pt-6 min-[1200px]:gap-7 min-[1200px]:px-0 min-[1200px]:pt-8">
        <div className="flex h-9 w-full items-center justify-between">
          <div className="group flex items-center gap-1">
            <FavoriteCheckbox
              checked={isAllSelected && totalCount > 0}
              disabled={totalCount === 0}
              onChange={handleToggleSelectAll}
              aria-label="전체선택"
            />
            <button
              type="button"
              onClick={handleToggleSelectAll}
              disabled={totalCount === 0}
              className={[
                "text-lg-regular whitespace-nowrap text-[var(--black-300)]",
                "max-[743px]:text-md-regular",
                "transition-colors hover:text-[var(--black-500)]",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
              ].join(" ")}
            >
              전체선택({selectedCount}/{totalCount})
            </button>
          </div>

          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={!hasSelection}
            className={[
              "rounded-md px-3 py-1 text-lg-regular whitespace-nowrap max-[743px]:text-md-regular",
              "transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
              hasSelection
                ? "text-[var(--input-placeholder)] hover:bg-[var(--gray-100)] hover:text-[var(--black-300)]"
                : "cursor-not-allowed text-[var(--gray-400)]",
            ].join(" ")}
          >
            선택 항목 삭제
          </button>
        </div>

        {totalCount === 0 ? (
          <section
            className="flex flex-col items-center justify-center gap-4 py-20"
            aria-live="polite"
          >
            <p className="text-lg-regular text-center text-[var(--input-placeholder)] min-[744px]:text-2xl-regular">
              찜한 기사님이 없어요!
            </p>
            <Link
              href={ROUTES.PUBLIC.MOVER_SEARCH}
              className={[
                "flex h-[54px] items-center justify-center rounded-xl bg-[var(--primary-400)]! px-4",
                "text-lg-semibold text-[var(--gray-50)]!",
                "min-[744px]:h-16 min-[744px]:rounded-2xl min-[744px]:text-2lg-semibold",
                "transition-opacity hover:opacity-90",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
              ].join(" ")}
            >
              기사님 찾으러 가기
            </Link>
          </section>
        ) : (
          <ul className="flex flex-col gap-5">
            {movers.map((mover) => (
              <li
                key={mover.id}
                className="flex w-full justify-center min-[744px]:block"
              >
                <MoverSearchCard
                  serviceType={mover.serviceType}
                  moverName={mover.moverName}
                  introduction={mover.introduction}
                  description={mover.description}
                  profileImageUrl={mover.profileImageUrl}
                  rating={mover.rating}
                  reviewCount={mover.reviewCount}
                  careerYears={mover.careerYears}
                  confirmedCount={mover.confirmedCount}
                  favoriteCount={mover.favoriteCount}
                  selectable
                  isSelected={selectedIds.includes(mover.id)}
                  onSelectChange={(isSelected) =>
                    handleSelectChange(mover.id, isSelected)
                  }
                  className="min-[744px]:w-full!"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
