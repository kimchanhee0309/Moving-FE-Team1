"use client";

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
  return (
    <div className="flex w-full flex-col gap-4 min-[1200px]:gap-8">
      <SearchInput
        label="기사님 별명 검색"
        placeholder="텍스트를 입력해 주세요."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        onClear={() => onSearchChange("")}
        inputSize={searchSize}
        containerClassName="!max-w-none w-full"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="지역"
            options={REGION_FILTER_OPTIONS}
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
            label="서비스"
            options={SERVICE_FILTER_OPTIONS}
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
          <button
            type="button"
            onClick={onReset}
            disabled={!canReset}
            className="text-lg-medium hidden text-[var(--gray-300)] disabled:cursor-not-allowed disabled:opacity-40 min-[1200px]:inline"
          >
            초기화
          </button>
        </div>

        <SortDropdown
          options={SORT_OPTIONS}
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
          ariaLabel="기사님 목록 정렬"
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
