"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import { MoverSearchCard } from "@/common/components/MoverSearch";
import { Pagination } from "@/common/components/Pagination";
import { ROUTES } from "@/common/constants/routes";

import { SIDEBAR_MOVER_LIMIT } from "../mover-search.constants";
import type {
  MoverSearchResult,
  MoverSearchSidebarVariant,
} from "../mover-search.types";

interface MoverSearchSidebarProps {
  variant: MoverSearchSidebarVariant;
  movers: MoverSearchResult[];
  isLoading?: boolean;
  favoriteIdSet?: ReadonlySet<string>;
  onFavoriteClick?: (mover: MoverSearchResult) => void;
}

export function MoverSearchSidebar({
  variant,
  movers,
  isLoading = false,
  favoriteIdSet,
  onFavoriteClick,
}: MoverSearchSidebarProps) {
  const t = useTranslations("Search");
  const title = t(variant === "favorite" ? "favorite" : "recommended");

  // 추천(비로그인·기사님)은 항상 처음 3명만 고정 표시합니다. 찜(로그인 고객)은 3명이
  // 넘으면 페이지네이션으로 나머지를 볼 수 있습니다. variant가 바뀌면(예: 로그인 전환)
  // 이전에 보던 페이지 번호가 그대로 남지 않도록, 바뀐 variant에서는 1페이지로 되돌립니다.
  const [pageState, setPageState] = useState({ variant, page: 1 });
  const page = pageState.variant === variant ? pageState.page : 1;

  const isPaginated = variant === "favorite";
  const totalPages = isPaginated
    ? Math.max(1, Math.ceil(movers.length / SIDEBAR_MOVER_LIMIT))
    : 1;
  const safePage = Math.min(page, totalPages);
  const visibleMovers = isPaginated
    ? movers.slice(
        (safePage - 1) * SIDEBAR_MOVER_LIMIT,
        safePage * SIDEBAR_MOVER_LIMIT,
      )
    : movers.slice(0, SIDEBAR_MOVER_LIMIT);

  return (
    <aside className="hidden w-[327px] shrink-0 flex-col gap-4 min-[1200px]:flex">
      {isLoading ? (
        <p className="text-md-regular text-[var(--gray-500)]">{t("loading")}</p>
      ) : (
        <>
          <h2 className="text-xl-semibold text-[var(--black-400)]">{title}</h2>
          {movers.length === 0 ? (
            <p className="text-md-regular text-[var(--gray-500)]">
              {t(variant === "favorite" ? "noFavorites" : "noRecommended")}
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-4">
                {visibleMovers.map((mover) => (
                  <li key={mover.id}>
                    <Link
                      href={ROUTES.PUBLIC.MOVER_DETAIL(mover.id)}
                      className="block"
                      aria-label={t("detail", { name: mover.moverName })}
                    >
                      <MoverSearchCard
                        size="sm"
                        serviceType={mover.serviceType}
                        serviceTypes={mover.serviceTypes}
                        moverName={mover.moverName}
                        introduction={mover.introduction}
                        description={mover.description}
                        profileImageUrl={mover.profileImageUrl}
                        rating={mover.rating}
                        reviewCount={mover.reviewCount}
                        careerYears={mover.careerYears}
                        confirmedCount={mover.confirmedCount}
                        favoriteCount={mover.favoriteCount}
                        isFavorite={favoriteIdSet?.has(mover.id) ?? false}
                        onFavoriteClick={
                          onFavoriteClick
                            ? () => onFavoriteClick(mover)
                            : undefined
                        }
                      />
                    </Link>
                  </li>
                ))}
              </ul>
              {isPaginated && totalPages > 1 ? (
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  size="sm"
                  className="justify-center"
                  ariaLabel={t("favoritePagination")}
                  onPageChange={(nextPage) =>
                    setPageState({ variant, page: nextPage })
                  }
                />
              ) : null}
            </>
          )}
        </>
      )}
    </aside>
  );
}
