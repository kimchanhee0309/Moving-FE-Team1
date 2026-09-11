"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MoverSearchCard } from "@/common/components/MoverSearch";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { authHref } from "@/features/auth/auth.utils";

import { useDebouncedSearch } from "../hooks/useDebouncedSearch";
import { useLoadMoreSentinel } from "../hooks/useLoadMoreSentinel";
import { useMoverSearchInfiniteQuery } from "../hooks/useMoverSearchInfiniteQuery";
import {
  useMoverSearchFavorites,
  useMoverSearchRecommended,
} from "../hooks/useMoverSearchSidebar";
import {
  DEFAULT_SORT_VALUE,
  MOVER_SEARCH_DEBOUNCE_MS,
} from "../mover-search.constants";
import type { MoverSearchSortValue } from "../mover-search.types";
import {
  getMoverSearchSidebarVariant,
  getMoverSearchViewer,
} from "../mover-search.utils";
import {
  createDefaultToolbarState,
  MoverSearchToolbar,
} from "./MoverSearchToolbar";
import { MoverSearchSidebar } from "./MoverSearchSidebar";

type OpenMenu = "region" | "service" | "sort" | null;

function useMinWidth(px: number) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${px}px)`);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [px]);

  return matches;
}

export function MoverSearchPageContent() {
  const router = useRouter();
  const { user, isPending: isAuthPending, error: authError } = useAuth();
  const isDesktopToolbar = useMinWidth(1200);
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [toolbar, setToolbar] = useState(createDefaultToolbarState);
  const debouncedSearch = useDebouncedSearch(
    toolbar.search,
    MOVER_SEARCH_DEBOUNCE_MS,
  );

  const listParams = useMemo(
    () => ({
      search: debouncedSearch,
      regions: toolbar.isAllRegions ? [] : toolbar.regionValues,
      services: toolbar.isAllServices ? [] : toolbar.serviceValues,
      sort: toolbar.sort,
    }),
    [
      debouncedSearch,
      toolbar.isAllRegions,
      toolbar.isAllServices,
      toolbar.regionValues,
      toolbar.serviceValues,
      toolbar.sort,
    ],
  );

  const viewer = getMoverSearchViewer(user, isAuthPending, Boolean(authError));
  const sidebarVariant = getMoverSearchSidebarVariant(viewer);
  const isCustomer = viewer === "customer";
  const canUseRecommended = viewer === "guest" || viewer === "mover";

  const listQuery = useMoverSearchInfiniteQuery(listParams);
  const recommendedQuery = useMoverSearchRecommended(canUseRecommended);
  const favoritesQuery = useMoverSearchFavorites(user?.id, isCustomer);

  const {
    data: listData,
    isPending: isListPending,
    isError: isListError,
    refetch: refetchList,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = listQuery;

  const moverList = useMemo(
    () => listData?.pages.flatMap((page) => page.items) ?? [],
    [listData],
  );

  const canReset =
    toolbar.search.length > 0 ||
    toolbar.regionValues.length > 0 ||
    toolbar.serviceValues.length > 0 ||
    toolbar.isAllRegions ||
    toolbar.isAllServices ||
    toolbar.sort !== DEFAULT_SORT_VALUE;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const sentinelRef = useLoadMoreSentinel(
    handleLoadMore,
    Boolean(hasNextPage) && !isFetchingNextPage,
  );

  const handleFavoriteClick = (moverId: string) => {
    if (viewer === "pending") {
      return;
    }

    if (viewer === "guest") {
      router.push(
        authHref(ROUTES.AUTH.LOGIN.CUSTOMER, ROUTES.PUBLIC.MOVER_SEARCH),
      );
      return;
    }

    if (viewer !== "customer") {
      return;
    }

    favoritesQuery.toggleFavorite(moverId);
  };

  const sidebarMovers = isCustomer
    ? favoritesQuery.movers
    : (recommendedQuery.data ?? []);
  const sidebarLoading =
    viewer === "pending" ||
    (isCustomer && favoritesQuery.isPending) ||
    (canUseRecommended && recommendedQuery.isPending);
  const canInteractFavorite = viewer === "guest" || viewer === "customer";

  return (
    <div className="bg-[var(--gray-50)]">
      <header className="hidden bg-[var(--gray-50)] py-8 shadow-[0px_2px_10px_0px_rgba(248,248,248,0.1)] min-[1200px]:block">
        <div className="mx-auto w-full max-w-[1200px] px-6 min-[1200px]:px-2">
          <h1 className="text-2xl-semibold text-[var(--black-500)]">
            기사님 찾기
          </h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1200px] gap-[53px] px-6 pb-10 pt-2.5 min-[744px]:px-[72px] min-[1200px]:px-0 min-[1200px]:pb-8 min-[1200px]:pt-0">
        <section className="flex min-w-0 flex-1 flex-col gap-8">
          <MoverSearchToolbar
            search={toolbar.search}
            onSearchChange={(search) =>
              setToolbar((current) => ({ ...current, search }))
            }
            regionValues={toolbar.regionValues}
            isAllRegions={toolbar.isAllRegions}
            onRegionChange={(regionValues, isAllRegions) =>
              setToolbar((current) => ({
                ...current,
                regionValues,
                isAllRegions,
              }))
            }
            serviceValues={toolbar.serviceValues}
            isAllServices={toolbar.isAllServices}
            onServiceChange={(serviceValues, isAllServices) =>
              setToolbar((current) => ({
                ...current,
                serviceValues,
                isAllServices,
              }))
            }
            sort={toolbar.sort}
            onSortChange={(sort: MoverSearchSortValue) =>
              setToolbar((current) => ({ ...current, sort }))
            }
            onReset={() => {
              setToolbar(createDefaultToolbarState());
              setOpenMenu(null);
            }}
            canReset={canReset}
            openMenu={openMenu}
            onOpenMenuChange={setOpenMenu}
            dropdownSize={isDesktopToolbar ? "md" : "sm"}
            searchSize={isDesktopToolbar ? "md" : "sm"}
          />

          {isListPending ? (
            <LoadingState message="기사님 목록을 불러오는 중이에요." />
          ) : isListError ? (
            <ErrorState
              title="기사님 목록을 불러오지 못했어요."
              onRetry={() => void refetchList()}
            />
          ) : moverList.length === 0 ? (
            <EmptyState
              title="조건에 맞는 기사님이 없어요."
              description="검색어나 필터를 바꿔 다시 찾아 보세요."
            />
          ) : (
            <ul className="flex flex-col gap-5">
              {moverList.map((mover) => (
                <li
                  key={mover.id}
                  className="flex justify-center min-[744px]:block"
                >
                  <Link
                    href={ROUTES.PUBLIC.MOVER_DETAIL(mover.id)}
                    className="block min-[744px]:w-full"
                    aria-label={`${mover.moverName} 기사님 상세 보기`}
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
                      isFavorite={favoritesQuery.favoriteIdSet.has(mover.id)}
                      onFavoriteClick={
                        canInteractFavorite
                          ? () => handleFavoriteClick(mover.id)
                          : undefined
                      }
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
          {isFetchingNextPage ? (
            <p className="text-md-regular py-4 text-center text-[var(--gray-400)]">
              더 불러오는 중이에요.
            </p>
          ) : null}
        </section>

        <MoverSearchSidebar
          variant={sidebarVariant}
          movers={sidebarMovers}
          isLoading={sidebarLoading}
          favoriteIdSet={favoritesQuery.favoriteIdSet}
          onFavoriteClick={
            canInteractFavorite ? handleFavoriteClick : undefined
          }
        />
      </div>
    </div>
  );
}
