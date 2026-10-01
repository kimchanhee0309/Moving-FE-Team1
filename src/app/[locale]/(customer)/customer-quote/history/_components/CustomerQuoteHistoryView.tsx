"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { FilterDropdown } from "@/common/components/Dropdown";
import { EmptyState } from "@/common/components/page-state";
import { ErrorState } from "@/common/components/page-state";
import { LoadingState } from "@/common/components/page-state";
import { Tabs } from "@/common/components/Tabs";
import { QUOTE_STATUS } from "@/common/constants/domain";
import type { QuoteStatus } from "@/common/constants/domain";
import { ROUTES } from "@/common/constants/routes";
import { formatDateWithWeekday, SERVICE_TIME_ZONE } from "@/common/utils/date-format";
import { groupHistoryQuotes } from "@/features/customer-quote/api/customer-quote.mapper";
import type { CustomerQuoteHistoryGroupView } from "@/features/customer-quote/api/customer-quote.types";
import { QuoteHistoryCard } from "@/features/customer-quote/components";
import { useCustomerQuoteLoadMoreSentinel } from "@/features/customer-quote/hooks/useCustomerQuoteLoadMoreSentinel";
import { useReceivedQuoteHistoryQuery } from "@/features/customer-quote/hooks/useCustomerQuoteQueries";
import { Link } from "@/i18n/navigation";

type QuoteFilterValue = "all" | QuoteStatus;

const QUOTE_FILTER_VALUES = [QUOTE_STATUS.CONFIRMED, QUOTE_STATUS.PENDING] as const;
const QUOTE_FILTER_LABEL_KEYS = {
  [QUOTE_STATUS.CONFIRMED]: "confirmed",
  [QUOTE_STATUS.PENDING]: "pending",
} as const;

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

function HistoryRequestCard({ group }: { group: CustomerQuoteHistoryGroupView }) {
  const t = useTranslations("CustomerQuote");
  const quote = useTranslations("Quote");
  const moveType = useTranslations("MoveType");
  const locale = useLocale();
  const filterOptions = QUOTE_FILTER_VALUES.map((value) => ({
    value,
    label: quote(QUOTE_FILTER_LABEL_KEYS[value]),
  }));
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
              {quote("info")}
            </h2>
            <p className="text-md-regular text-[var(--content-muted)]">
              {group.requestedAt}
            </p>
          </div>
          <dl className="flex flex-col gap-4">
            <QuoteInfoRow
              label={quote("moveType")}
              value={moveType(group.serviceType)}
            />
            <QuoteInfoRow label={quote("from")} value={group.from} />
            <QuoteInfoRow label={quote("to")} value={group.to} />
            <QuoteInfoRow
              label={quote("useDate")}
              value={formatDateWithWeekday(group.moveDate, locale, SERVICE_TIME_ZONE)}
            />
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
            <span className="text-[var(--black-400)]">{t("quoteList")}</span>
            <span className="text-[var(--primary-400)]">
              {group.quotes.length}
            </span>
          </h2>

          <FilterDropdown
            allOptionLabel={t("all")}
            isAllSelected={false}
            isOpen={isFilterOpen}
            label={t("all")}
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
            options={filterOptions}
            selectionMode="single"
            showAllOption
            size="md"
            values={filter === "all" ? [] : [filter]}
          />

          {visibleQuotes.length > 0 ? (
            <ul className="flex w-full flex-col">
              {visibleQuotes.map((item) => (
                <li key={item.id}>
                  <Link
                    aria-label={t("detailLink", { name: item.moverName })}
                    className={[
                      "block w-full rounded-xl text-left",
                      "hover:bg-[var(--background-200)]",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
                    ].join(" ")}
                    href={ROUTES.CUSTOMER.QUOTE.HISTORY_DETAIL(item.id)}
                  >
                    <QuoteHistoryCard
                      careerYears={item.careerYears}
                      confirmedCount={item.confirmedCount}
                      favoriteCount={item.favoriteCount}
                      isDesignated={item.isDesignated}
                      message={item.message}
                      moverName={item.moverName}
                      moverProfileImageUrl={item.moverProfileImageUrl}
                      price={item.price}
                      rating={item.rating}
                      reviewCount={item.reviewCount}
                      serviceType={item.serviceType}
                      status={item.status}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-md-regular py-10 text-center text-[var(--content-muted)]">
              {t("noFilteredQuotes")}
            </p>
          )}
        </section>
      </div>
    </article>
  );
}

export function CustomerQuoteHistoryView() {
  const t = useTranslations("CustomerQuote");
  const common = useTranslations("Common");
  const historyQuery = useReceivedQuoteHistoryQuery();

  const groups = useMemo(() => {
    const items =
      historyQuery.data?.pages.flatMap((page) => page.items) ?? [];
    return groupHistoryQuotes(items);
  }, [historyQuery.data]);

  const handleLoadMore = useCallback(() => {
    if (historyQuery.hasNextPage && !historyQuery.isFetchingNextPage) {
      void historyQuery.fetchNextPage();
    }
  }, [historyQuery]);

  const sentinelRef = useCustomerQuoteLoadMoreSentinel(
    handleLoadMore,
    Boolean(historyQuery.hasNextPage) && !historyQuery.isFetchingNextPage,
  );

  return (
    <main className="min-h-screen bg-[var(--background-100)]">
      <h1 className="sr-only">{t("historyTab")}</h1>
      <Tabs
        ariaLabel={t("tabs")}
        items={[
          {
            href: ROUTES.CUSTOMER.QUOTE.PENDING,
            id: "pending",
            label: t("pendingTab"),
          },
          {
            href: ROUTES.CUSTOMER.QUOTE.HISTORY,
            id: "history",
            label: t("historyTab"),
          },
        ]}
        value="history"
      />
      <section
        aria-label={t("historyList")}
        className={[
          "flex flex-col gap-10 px-6 py-6",
          "min-[744px]:px-[72px] min-[744px]:py-10",
          "min-[1200px]:px-[clamp(72px,18.75vw,400px)] min-[1200px]:py-16",
        ].join(" ")}
      >
        {historyQuery.isLoading ? (
          <LoadingState message={t("historyLoading")} />
        ) : null}

        {historyQuery.isError ? (
          <ErrorState
            title={t("historyLoadError")}
            description={common("errorDescription")}
            onRetry={() => {
              void historyQuery.refetch();
            }}
          />
        ) : null}

        {!historyQuery.isLoading &&
        !historyQuery.isError &&
        groups.length === 0 ? (
          <EmptyState
            title={t("historyEmpty")}
            description={t("historyEmptyDescription")}
          />
        ) : null}

        {!historyQuery.isLoading &&
        !historyQuery.isError &&
        groups.length > 0 ? (
          <>
            {groups.map((group) => (
              <HistoryRequestCard key={group.id} group={group} />
            ))}

            <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

            {historyQuery.isFetchingNextPage ? (
              <p className="text-md-regular text-center text-[var(--content-muted)]">
                {t("loadingMore")}
              </p>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
