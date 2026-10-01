"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { MoverSearchCard } from "@/common/components/MoverSearch";
import { ROUTES } from "@/common/constants/routes";

import type {
  MoverSearchResult,
  MoverSearchSidebarVariant,
} from "../mover-search.types";

interface MoverSearchSidebarProps {
  variant: MoverSearchSidebarVariant;
  movers: MoverSearchResult[];
  isLoading?: boolean;
  favoriteIdSet?: ReadonlySet<string>;
  onFavoriteClick?: (moverId: string) => void;
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

  return (
    <aside className="hidden w-[327px] shrink-0 flex-col gap-4 min-[1200px]:flex">
      {isLoading ? (
        <p className="text-md-regular text-[var(--gray-500)]">
          {t("loading")}
        </p>
      ) : (
        <>
          <h2 className="text-xl-semibold text-[var(--black-400)]">{title}</h2>
          {movers.length === 0 ? (
            <p className="text-md-regular text-[var(--gray-500)]">
              {t(variant === "favorite" ? "noFavorites" : "noRecommended")}
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {movers.map((mover) => (
                <li key={mover.id}>
                  <Link
                    href={ROUTES.PUBLIC.MOVER_DETAIL(mover.id)}
                    className="block"
                    aria-label={t("detail", {name: mover.moverName})}
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
                          ? () => onFavoriteClick(mover.id)
                          : undefined
                      }
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </aside>
  );
}
