"use client";

import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import {
  DateDropdown,
  FilterDropdown,
  SortDropdown,
} from "@/common/components/Dropdown";

const SERVICE_OPTIONS = [
  { value: "small", label: "소형이사" },
  { value: "home", label: "가정이사" },
  { value: "office", label: "사무실이사" },
] as const;

const REGION_OPTIONS = [
  { value: "seoul", label: "서울" },
  { value: "gyeonggi", label: "경기" },
  { value: "incheon", label: "인천" },
  { value: "gangwon", label: "강원" },
  { value: "chungcheong", label: "충청" },
  { value: "jeolla", label: "전라" },
  { value: "gyeongsang", label: "경상" },
  { value: "jeju", label: "제주" },
] as const;

const SORT_OPTIONS = [
  { value: "reviews", label: "리뷰 많은순" },
  { value: "rating", label: "평점 높은순" },
  { value: "career", label: "경력 높은순" },
  { value: "confirmed", label: "확정 많은순" },
] as const;

export default function DropdownExamplePage() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [areAllServicesSelected, setAreAllServicesSelected] = useState(false);
  const [regions, setRegions] = useState<string[]>([]);
  const [areAllRegionsSelected, setAreAllRegionsSelected] = useState(false);
  const [sort, setSort] = useState("reviews");

  const controlOpenState = (id: string) => (isOpen: boolean) => {
    setOpenDropdown(isOpen ? id : null);
  };

  const changeServices: ComponentProps<typeof FilterDropdown>["onChange"] = (
    values,
    meta,
  ) => {
    setServices(values);
    setAreAllServicesSelected(meta.isAllSelected);
  };

  const changeRegions: ComponentProps<typeof FilterDropdown>["onChange"] = (
    values,
    meta,
  ) => {
    setRegions(values);
    setAreAllRegionsSelected(meta.isAllSelected);
  };

  return (
    <main className="min-h-screen bg-[var(--background-100)] px-6 py-10 text-[var(--black-500)] min-[744px]:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header>
          <h1 className="text-2xl-bold">Dropdown 공통 컴포넌트</h1>
          <p className="text-md-regular mt-2 text-[var(--gray-500)]">
            Figma의 필터, Dropdown2, Sort 상태를 확인하는 예시입니다. GNB의
            프로필·알림 메뉴는 GNB 컴포넌트에서 관리합니다.
          </p>
        </header>

        <ExampleSection
          description="필터 선택 방식과 지역용 2열 목록, sm/md 크기를 확인합니다."
          title="필터 Dropdown"
        >
          <FilterDropdown
            isOpen={openDropdown === "service-sm"}
            isAllSelected={areAllServicesSelected}
            label="서비스"
            onChange={changeServices}
            onOpenChange={controlOpenState("service-sm")}
            options={SERVICE_OPTIONS}
            values={services}
          />
          <FilterDropdown
            isOpen={openDropdown === "region-md"}
            isAllSelected={areAllRegionsSelected}
            label="지역"
            layout="two-column"
            onChange={changeRegions}
            onOpenChange={controlOpenState("region-md")}
            options={REGION_OPTIONS}
            size="md"
            values={regions}
          />
          <FilterDropdown
            disabled
            isOpen={false}
            label="비활성"
            onChange={() => undefined}
            onOpenChange={() => undefined}
            options={SERVICE_OPTIONS}
            values={[]}
          />
          <FilterDropdown
            isLoading
            isOpen={false}
            label="불러오는 중"
            onChange={() => undefined}
            onOpenChange={() => undefined}
            options={SERVICE_OPTIONS}
            values={[]}
          />
        </ExampleSection>

        <ExampleSection
          description="캘린더 본체는 페이지 담당자가 선택한 라이브러리를 panel로 연결합니다."
          title="Dropdown2 · 날짜 트리거"
        >
          <div className="w-full">
            <DateDropdown
              isOpen={openDropdown === "date"}
              onOpenChange={controlOpenState("date")}
              panel={
                <div className="text-md-medium w-[280px] rounded-xl border border-[var(--line-200)] bg-white p-5 shadow-lg">
                  페이지에서 캘린더 라이브러리를 연결하는 영역
                </div>
              }
              valueLabel="2026년 9월 12일"
            />
          </div>
          <div className="w-full">
            <DateDropdown
              error="이사 날짜를 다시 확인해 주세요."
              isOpen={false}
              onOpenChange={() => undefined}
              valueLabel="날짜를 선택해 주세요"
            />
          </div>
        </ExampleSection>

        <ExampleSection
          description="목록 페이지에서 사용할 sm/md 정렬 선택 상태입니다."
          title="Sort"
        >
          <SortDropdown
            isOpen={openDropdown === "sort-sm"}
            onChange={setSort}
            onOpenChange={controlOpenState("sort-sm")}
            options={SORT_OPTIONS}
            value={sort}
          />
          <SortDropdown
            isOpen={openDropdown === "sort-md"}
            onChange={setSort}
            onOpenChange={controlOpenState("sort-md")}
            options={SORT_OPTIONS}
            size="md"
            value={sort}
          />
        </ExampleSection>
      </div>
    </main>
  );
}

interface ExampleSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

function ExampleSection({ title, description, children }: ExampleSectionProps) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-[2px_2px_16px_rgba(0,0,0,0.04)]">
      <h2 className="text-xl-bold">{title}</h2>
      <p className="text-md-regular mt-1 text-[var(--gray-500)]">{description}</p>
      <div className="mt-6 flex flex-wrap items-start gap-6">{children}</div>
    </section>
  );
}
