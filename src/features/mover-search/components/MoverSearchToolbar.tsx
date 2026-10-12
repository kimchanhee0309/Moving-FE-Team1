"use client";

import { useTranslations } from "next-intl";
import { useProfileOptionLabel } from "@/common/components/ProfileSelectionChip/useProfileOptionLabel";

import { FilterDropdown } from "@/common/components/Dropdown/FilterDropdown";
import { SortDropdown } from "@/common/components/Dropdown/SortDropdown";
import { SearchInput } from "@/common/components/Input/SearchInput";

import {
  DEFAULT_SORT_VALUE,
  REGION_FILTER_OPTIONS,
  SERVICE_FILTER_OPTIONS,
  SORT_OPTIONS,
} from "../mover-search.constants";
import type { MoverSearchSortValue } from "../mover-search.types";

type OpenMenu = "region" | "service" | "sort" | null;

interface MoverSearchToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  regionValues: string[];
  isAllRegions: boolean;
  onRegionChange: (values: string[], isAllSelected: boolean) => void;
  serviceValues: string[];
  isAllServices: boolean;
  onServiceChange: (values: string[], isAllSelected: boolean) => void;
  sort: MoverSearchSortValue;
  onSortChange: (value: MoverSearchSortValue) => void;
  onReset: () => void;
  canReset: boolean;
  openMenu: OpenMenu;
  onOpenMenuChange: (menu: OpenMenu) => void;
  dropdownSize: "sm" | "md";
  searchSize: "sm" | "md";
}

export function MoverSearchToolbar({
  search,
  onSearchChange,
  regionValues,
  isAllRegions,
  onRegionChange,
  serviceValues,
  isAllServices,
  onServiceChange,
  sort,
  onSortChange,
  onReset,
  canReset,
  openMenu,
  onOpenMenuChange,
  dropdownSize,
  searchSize,
}: MoverSearchToolbarProps) {
  const t = useTranslations("Search");
  const optionLabel = useProfileOptionLabel();
  const regionOptions = REGION_FILTER_OPTIONS.map((option) => ({...option, label: optionLabel(option.label, option.label)}));
  const serviceOptions = SERVICE_FILTER_OPTIONS.map((option) => ({...option, label: optionLabel(option.value, option.label)}));
  const sortOptions = SORT_OPTIONS.map((option) => ({...option, label: t(option.value === "reviewCount" ? "reviewsSort" : option.value === "rating" ? "ratingSort" : option.value === "careerYears" ? "experienceSort" : "confirmedSort")}));
  return (
    <div className="flex w-full flex-col gap-4 min-[1200px]:gap-8">
      <SearchInput
        label={t("searchLabel")}
        placeholder={t("searchPlaceholder")}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={() => onSearchChange("")}
        inputSize={searchSize}
        containerClassName="!max-w-none w-full"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center">
          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              label={t("region")}
              options={regionOptions}
              allOptionLabel={t("all")}
              values={regionValues}
              isAllSelected={isAllRegions}
              onChange={(values, meta) =>
                onRegionChange(values, meta.isAllSelected)
              }
              isOpen={openMenu === "region"}
              onOpenChange={(isOpen) =>
                onOpenMenuChange(isOpen ? "region" : null)
              }
              layout="two-column"
              size={dropdownSize}
            />
            <FilterDropdown
              label={t("service")}
              options={serviceOptions}
              allOptionLabel={t("all")}
              values={serviceValues}
              isAllSelected={isAllServices}
              onChange={(values, meta) =>
                onServiceChange(values, meta.isAllSelected)
              }
              isOpen={openMenu === "service"}
              onOpenChange={(isOpen) =>
                onOpenMenuChange(isOpen ? "service" : null)
              }
              size={dropdownSize}
            />
          </div>
          {/* 데스크톱에서만 보이는 초기화. 서비스 필터와의 간격은 25px */}
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            className="text-lg-medium hidden text-[var(--gray-300)] disabled:cursor-not-allowed disabled:opacity-40 min-[1200px]:ml-[25px] min-[1200px]:inline"
          >
            {t("reset")}
          </button>
        </div>

        <SortDropdown
          options={sortOptions}
          value={sort}
          onChange={(value) => {
            const next = SORT_OPTIONS.find((option) => option.value === value);
            if (next) {
              onSortChange(next.value);
            }
          }}
          isOpen={openMenu === "sort"}
          onOpenChange={(isOpen) => onOpenMenuChange(isOpen ? "sort" : null)}
          size={dropdownSize === "md" ? "md" : "sm"}
          ariaLabel={t("sortLabel")}
        />
      </div>
    </div>
  );
}

export function createDefaultToolbarState() {
  return {
    search: "",
    regionValues: [] as string[],
    isAllRegions: false,
    serviceValues: [] as string[],
    isAllServices: false,
    sort: DEFAULT_SORT_VALUE,
  };
}
