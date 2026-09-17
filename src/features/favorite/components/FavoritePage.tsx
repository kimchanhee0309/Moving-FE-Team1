"use client";

import Link from "next/link";
import { useState } from "react";

import { ApiError } from "@/common/api/error";
import { MoverSearchCard } from "@/common/components/MoverSearch";
import { ROUTES } from "@/common/constants/routes";

import {
  useFavoriteMovers,
  useRemoveFavoriteMovers,
} from "../hooks/useFavoriteMovers";
import type { FavoriteMover } from "../favorite.types";

const EMPTY_MOVERS: FavoriteMover[] = [];

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

/**
 * 찜한 기사님 페이지입니다.
 * GET /favorites 목록·DELETE 선택 삭제만 담당하며 기사님 찾기 찜 토글은 연동하지 않습니다.
 */
export function FavoritePage() {
  const favoritesQuery = useFavoriteMovers();
  const removeMutation = useRemoveFavoriteMovers();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  const movers = favoritesQuery.data ?? EMPTY_MOVERS;
  const moverIdSet = new Set(movers.map((mover) => mover.id));
  // 목록 갱신 후 사라진 id는 선택 카운트에서 제외합니다.
  const activeSelectedIds = selectedIds.filter((id) => moverIdSet.has(id));
  const totalCount = movers.length;
  const selectedCount = activeSelectedIds.length;
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const hasSelection = selectedCount > 0;
  const isBusy = removeMutation.isPending;

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
    if (activeSelectedIds.length === 0 || isBusy) return;

    setActionError(null);
    const idsToRemove = [...activeSelectedIds];

    removeMutation.mutate(idsToRemove, {
      // 삭제 중 새로 고른 항목은 유지하고, 요청에 포함된 id만 제거합니다.
      onSuccess: () => {
        setSelectedIds((previousIds) =>
          previousIds.filter((id) => !idsToRemove.includes(id)),
        );
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? error.message
            : "선택한 찜을 삭제하지 못했습니다. 다시 시도해 주세요.";
        setActionError(message);
      },
    });
  };

  const listErrorMessage =
    favoritesQuery.error instanceof ApiError
      ? favoritesQuery.error.message
      : "찜 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";

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
              disabled={totalCount === 0 || isBusy || favoritesQuery.isPending}
              onChange={handleToggleSelectAll}
              aria-label="전체선택"
            />
            <button
              type="button"
              onClick={handleToggleSelectAll}
              disabled={totalCount === 0 || isBusy || favoritesQuery.isPending}
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
            disabled={!hasSelection || isBusy}
            className={[
              "rounded-md px-3 py-1 text-lg-regular whitespace-nowrap max-[743px]:text-md-regular",
              "transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
              hasSelection && !isBusy
                ? "text-[var(--input-placeholder)] hover:bg-[var(--gray-100)] hover:text-[var(--black-300)]"
                : "cursor-not-allowed text-[var(--gray-400)]",
            ].join(" ")}
          >
            {isBusy ? "삭제 중..." : "선택 항목 삭제"}
          </button>
        </div>

        {actionError ? (
          <p role="alert" className="text-md-regular text-[var(--primary-400)]">
            {actionError}
          </p>
        ) : null}

        {favoritesQuery.isPending ? (
          <p role="status" className="py-20 text-center text-lg-regular text-[var(--input-placeholder)]">
            찜한 기사님을 불러오는 중입니다.
          </p>
        ) : favoritesQuery.isError ? (
          <section
            className="flex flex-col items-center justify-center gap-4 py-20"
            role="alert"
          >
            <p className="text-lg-regular text-center text-[var(--input-placeholder)] min-[744px]:text-2xl-regular">
              {listErrorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                void favoritesQuery.refetch();
              }}
              className={[
                "flex h-[54px] items-center justify-center rounded-xl bg-[var(--primary-400)]! px-4",
                "text-lg-semibold text-[var(--gray-50)]!",
                "min-[744px]:h-16 min-[744px]:rounded-2xl min-[744px]:text-2lg-semibold",
                "transition-opacity hover:opacity-90",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
              ].join(" ")}
            >
              다시 시도
            </button>
          </section>
        ) : totalCount === 0 ? (
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
