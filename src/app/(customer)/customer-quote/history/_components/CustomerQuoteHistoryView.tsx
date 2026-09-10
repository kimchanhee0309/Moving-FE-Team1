"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FilterDropdown } from "@/common/components/Dropdown";
import { Tabs } from "@/common/components/Tabs";
import { QUOTE_STATUS } from "@/common/constants/domain";
import type { QuoteStatus } from "@/common/constants/domain";
import { ROUTES } from "@/common/constants/routes";
import { QuoteHistoryCard } from "@/features/customer-quote/components";

import { SERVICE_TYPE_LABEL } from "../../_lib/customerQuoteDetail";
import {
  MOCK_HISTORY_GROUPS,
  type HistoryRequestGroup,
} from "../_data/mockHistoryGroups";

type QuoteFilterValue = "all" | QuoteStatus;

const QUOTE_FILTER_OPTIONS = [
  { value: QUOTE_STATUS.CONFIRMED, label: "확정견적" },
  { value: QUOTE_STATUS.PENDING, label: "견적대기" },
] as const;

function QuoteInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start justify-between gap-3">
      <dt className="text-lg-semibold shrink-0 text-[var(--primary-400)]">
        {label}
      </dt>
      <dd className="text-lg-semibold text-right text-[var(--black-500)]">
        {value}
      </dd>
    </div>
  );
}

function HistoryRequestCard({ group }: { group: HistoryRequestGroup }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filter, setFilter] = useState<QuoteFilterValue>("all");

  const visibleQuotes = useMemo(() => {
    if (filter === "all") {
      return group.quotes;
    }

    return group.quotes.filter((quote) => quote.status === filter);
  }, [filter, group.quotes]);

  return (
    <article
      className={[
        "flex w-full flex-col rounded-[20px] border-[0.5px] border-[var(--line-100)] bg-[var(--gray-50)]",
        "shadow-[-2px_-2px_10px_rgba(220,220,220,0.14),2px_2px_10px_rgba(220,220,220,0.14)]",
        "px-5 py-8",
        "min-[744px]:px-10 min-[744px]:pb-10 min-[744px]:pt-12",
      ].join(" ")}
    >
      <div className="flex flex-col gap-10 min-[1200px]:flex-row min-[1200px]:items-start min-[1200px]:gap-[60px]">
        <section
          aria-labelledby={`${group.id}-info-title`}
          className="flex w-full shrink-0 flex-col gap-10 min-[1200px]:w-[260px]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2
              id={`${group.id}-info-title`}
              className="text-xl-semibold text-[var(--black-400)]"
            >
              견적 정보
            </h2>
            <p className="text-md-regular text-[var(--content-muted)]">
              {group.requestedAt}
            </p>
          </div>
          <dl className="flex flex-col gap-4">
            <QuoteInfoRow
              label="이사 유형"
              value={SERVICE_TYPE_LABEL[group.serviceType]}
            />
            <QuoteInfoRow label="출발지" value={group.from} />
            <QuoteInfoRow label="도착지" value={group.to} />
            <QuoteInfoRow label="이용일" value={group.moveDate} />
          </dl>
        </section>

        <div
          className="hidden h-auto w-px self-stretch bg-[var(--line-200)] min-[1200px]:block"
          aria-hidden="true"
        />

        <section
          aria-labelledby={`${group.id}-quote-list-title`}
          className="flex min-w-0 flex-1 flex-col gap-5"
        >
          <h2
            id={`${group.id}-quote-list-title`}
            className="text-xl-semibold flex items-start gap-2"
          >
            <span className="text-[var(--black-400)]">견적서 목록</span>
            <span className="text-[var(--primary-400)]">
              {group.quotes.length}
            </span>
          </h2>

          <FilterDropdown
            allOptionLabel="전체"
            isAllSelected={false}
            isOpen={isFilterOpen}
            label="전체"
            onChange={(values) => {
              const nextValue = values[0];
              setFilter(
                nextValue === QUOTE_STATUS.CONFIRMED ||
                  nextValue === QUOTE_STATUS.PENDING
                  ? nextValue
                  : "all",
              );
            }}
            onOpenChange={setIsFilterOpen}
            options={QUOTE_FILTER_OPTIONS}
            selectionMode="single"
            showAllOption
            size="md"
            values={filter === "all" ? [] : [filter]}
          />

          {visibleQuotes.length > 0 ? (
            <ul className="flex w-full flex-col">
              {visibleQuotes.map((quote) => (
                <li key={quote.id}>
                  <Link
                    aria-label={`${quote.moverName} 기사님 견적 상세 보기`}
                    className={[
                      "block w-full rounded-xl text-left",
                      "hover:bg-[var(--background-200)]",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
                    ].join(" ")}
                    href={ROUTES.CUSTOMER.QUOTE.HISTORY_DETAIL(quote.id)}
                  >
                    <QuoteHistoryCard
                      careerYears={quote.careerYears}
                      confirmedCount={quote.confirmedCount}
                      favoriteCount={quote.favoriteCount}
                      isDesignated={quote.isDesignated}
                      message={quote.message}
                      moverName={quote.moverName}
                      price={quote.price}
                      rating={quote.rating}
                      reviewCount={quote.reviewCount}
                      serviceType={quote.serviceType}
                      status={quote.status}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-md-regular py-10 text-center text-[var(--content-muted)]">
              조건에 맞는 견적서가 없습니다.
            </p>
          )}
        </section>
      </div>
    </article>
  );
}

export function CustomerQuoteHistoryView() {
  return (
    <main className="min-h-screen bg-[var(--background-100)]">
      <h1 className="sr-only">받았던 견적</h1>
      <Tabs
        ariaLabel="견적 목록"
        items={[
          {
            href: ROUTES.CUSTOMER.QUOTE.PENDING,
            id: "pending",
            label: "대기 중인 견적",
          },
          {
            href: ROUTES.CUSTOMER.QUOTE.HISTORY,
            id: "history",
            label: "받았던 견적",
          },
        ]}
        value="history"
      />
      <section
        aria-label="받았던 견적 목록"
        className={[
          "flex flex-col gap-10 px-6 py-6",
          "min-[744px]:px-[72px] min-[744px]:py-10",
          "min-[1200px]:px-[clamp(72px,18.75vw,400px)] min-[1200px]:py-16",
        ].join(" ")}
      >
        {MOCK_HISTORY_GROUPS.map((group) => (
          <HistoryRequestCard key={group.id} group={group} />
        ))}
      </section>
    </main>
  );
}
