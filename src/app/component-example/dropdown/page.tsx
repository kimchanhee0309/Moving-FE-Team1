"use client";

import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import {
  CustomerProfileDropdown,
  DateDropdown,
  FilterDropdown,
  MoverProfileDropdown,
  NotificationDropdown,
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

const NOTIFICATIONS = [
  {
    id: "quote-arrived",
    title: "김사과 기사님의 소형이사 견적이 도착했어요",
    highlightedTexts: ["소형이사 견적"],
    createdAt: "2시간 전",
  },
  {
    id: "quote-confirmed",
    title: "선택하신 견적의 예약이 확정되었어요",
    highlightedTexts: ["확정"],
    createdAt: "어제",
  },
  {
    id: "move-day",
    title: "경기(일산) → 서울 이사 예정일이에요",
    highlightedTexts: ["경기(일산) → 서울", "이사 예정일"],
    createdAt: "2일 전",
    isRead: true,
  },
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
            Figma의 필터, Dropdown2, 프로필, 알림, Sort 상태를 확인하는 예시입니다.
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
          description="고객용과 기사님용 전체 메뉴를 분리하고, 이름과 각 메뉴 동작만 전달합니다."
          title="프로필 Dropdown"
        >
          <CustomerProfileDropdown
            align="left"
            customerName="김가나"
            favoriteMoversAction={{ href: "/favorite" }}
            isOpen={openDropdown === "customer-profile"}
            logoutAction={{ onSelect: () => undefined }}
            movingReviewsAction={{ href: "/review/written" }}
            onOpenChange={controlOpenState("customer-profile")}
            profileEditAction={{ href: "/customer-profile/edit" }}
            size="md"
            trigger={<AvatarLabel label="고객" />}
            triggerAriaLabel="일반 유저 프로필 메뉴 열기"
          />
          <MoverProfileDropdown
            align="left"
            isOpen={openDropdown === "mover-profile"}
            logoutAction={{ onSelect: () => undefined }}
            moverName="김코드"
            myPageAction={{ href: "/mover-mypage" }}
            onOpenChange={controlOpenState("mover-profile")}
            size="sm"
            trigger={<AvatarLabel label="기사" />}
            triggerAriaLabel="기사님 프로필 메뉴 열기"
          />
        </ExampleSection>

        <ExampleSection
          description="알림 패널은 sm/md 반응형 폭, 로딩·오류·빈 상태를 지원합니다."
          title="알림 Dropdown"
        >
          <NotificationDropdown
            align="left"
            isOpen={openDropdown === "notification"}
            items={NOTIFICATIONS}
            onOpenChange={controlOpenState("notification")}
            trigger={<BellLabel />}
          />
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

function AvatarLabel({ label }: { label: string }) {
  return (
    <span className="text-xs-semibold flex size-12 items-center justify-center rounded-full bg-[var(--primary-100)] text-[var(--primary-400)]">
      {label}
    </span>
  );
}

function BellLabel() {
  return (
    <span className="text-lg-semibold flex size-12 items-center justify-center rounded-full border border-[var(--line-200)] bg-white">
      알림
    </span>
  );
}
