"use client";

import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";

import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { EmptyState } from "@/common/components/page-state";
import { ErrorState } from "@/common/components/page-state";
import { LoadingState } from "@/common/components/page-state";
import { SubHeader } from "@/common/components/SubHeader";
import { Tabs } from "@/common/components/Tabs";
import { ROUTES } from "@/common/constants/routes";
import { formatDateWithWeekday, formatLongDate, SERVICE_TIME_ZONE } from "@/common/utils/date-format";
import { QuoteCard } from "@/features/customer-quote/components";
import { useCustomerQuoteLoadMoreSentinel } from "@/features/customer-quote/hooks/useCustomerQuoteLoadMoreSentinel";
import {
  useActiveMoveRequestQuery,
  useConfirmReceivedQuoteMutation,
  useReceivedQuotesQuery,
} from "@/features/customer-quote/hooks/useCustomerQuoteQueries";
import { useRouter } from "@/i18n/navigation";

export function CustomerQuoteListView() {
  const t = useTranslations("CustomerQuote");
  const apiErrorMessage = useApiErrorMessage();
  const quote = useTranslations("Quote");
  const common = useTranslations("Common");
  const locale = useLocale();
  const router = useRouter();
  const quotesQuery = useReceivedQuotesQuery();
  const moveRequestQuery = useActiveMoveRequestQuery();
  const confirmMutation = useConfirmReceivedQuoteMutation();
  const [confirmError, setConfirmError] = useState<string | null>(null);
  // isPending 리렌더 전에 연속 클릭되면 mutate가 두 번 호출될 수 있어 동기 잠금으로 막습니다.
  const isConfirmLockedRef = useRef(false);

  const quotes = useMemo(
    () => quotesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [quotesQuery.data],
  );
  const moveRequest = moveRequestQuery.data;

  const handleLoadMore = useCallback(() => {
    if (quotesQuery.hasNextPage && !quotesQuery.isFetchingNextPage) {
      void quotesQuery.fetchNextPage();
    }
  }, [quotesQuery]);

  const sentinelRef = useCustomerQuoteLoadMoreSentinel(
    handleLoadMore,
    Boolean(quotesQuery.hasNextPage) && !quotesQuery.isFetchingNextPage,
  );

  const handleConfirm = useCallback(
    (quoteId: string) => {
      if (isConfirmLockedRef.current) {
        return;
      }
      isConfirmLockedRef.current = true;
      setConfirmError(null);
      confirmMutation.mutate(quoteId, {
        onSuccess: (quote) => {
          router.replace(ROUTES.CUSTOMER.QUOTE.HISTORY_DETAIL(quote.id));
        },
        onError: (error) => {
          setConfirmError(
            apiErrorMessage(
              error,
              quote("confirmError"),
            ),
          );
        },
        onSettled: () => {
          isConfirmLockedRef.current = false;
        },
      });
    },
    [apiErrorMessage, confirmMutation, quote, router],
  );

  return (
    <main className="min-h-screen bg-[var(--background-100)]">
      <h1 className="sr-only">{t("title")}</h1>
      <Tabs
        ariaLabel={t("tabs")}
        value="pending"
        items={[
          {
            id: "pending",
            label: t("pendingTab"),
            href: ROUTES.CUSTOMER.QUOTE.PENDING,
          },
          {
            id: "history",
            label: t("historyTab"),
            href: ROUTES.CUSTOMER.QUOTE.HISTORY,
          },
        ]}
      />

      {moveRequestQuery.isError ? (
        <div
          role="alert"
          className={[
            "flex items-center justify-between gap-3 border-b border-[var(--line-100)] bg-[var(--gray-50)]",
            "px-6 py-4",
            "min-[744px]:px-[72px]",
            "min-[1200px]:px-[clamp(72px,18.75vw,360px)]",
          ].join(" ")}
        >
          <p className="text-md-regular text-[var(--content-muted)]">
            {t("moveRequestError")}
          </p>
          <button
            type="button"
            className="text-md-semibold shrink-0 text-[var(--primary-400)]"
            onClick={() => {
              void moveRequestQuery.refetch();
            }}
          >
            {common("retry")}
          </button>
        </div>
      ) : null}

      {moveRequest ? (
        <SubHeader
          serviceType={moveRequest.serviceType}
          requestedAt={formatLongDate(moveRequest.requestedAt, locale, SERVICE_TIME_ZONE)}
          from={moveRequest.from}
          to={moveRequest.to}
          moveDate={formatDateWithWeekday(moveRequest.moveDate, locale, SERVICE_TIME_ZONE)}
        />
      ) : null}

      <section
        aria-label={t("receivedList")}
        className={[
          "px-6 py-6",
          "min-[744px]:px-[72px] min-[744px]:py-8",
          "min-[1200px]:px-[clamp(72px,18.75vw,360px)] min-[1200px]:py-10",
        ].join(" ")}
      >
        {quotesQuery.isLoading ? (
          <LoadingState message={t("loading")} />
        ) : null}

        {quotesQuery.isError ? (
          <ErrorState
            title={t("loadError")}
            description={common("errorDescription")}
            onRetry={() => {
              void quotesQuery.refetch();
            }}
          />
        ) : null}

        {confirmError ? (
          <p
            role="alert"
            className="text-md-regular mb-4 text-[var(--secondary-red-200)]"
          >
            {confirmError}
          </p>
        ) : null}

        {!quotesQuery.isLoading &&
        !quotesQuery.isError &&
        quotes.length === 0 ? (
          <EmptyState
            title={t("empty")}
            description={t("emptyDescription")}
          />
        ) : null}

        {!quotesQuery.isLoading && !quotesQuery.isError && quotes.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
              {quotes.map((item) => (
                <li key={item.id}>
                  <QuoteCard
                    serviceType={item.serviceType}
                    isDesignated={item.isDesignated}
                    status={item.status}
                    message={item.message}
                    moverName={item.moverName}
                    moverProfileImageUrl={item.moverProfileImageUrl}
                    rating={item.rating}
                    reviewCount={item.reviewCount}
                    careerYears={item.careerYears}
                    confirmedCount={item.confirmedCount}
                    favoriteCount={item.favoriteCount}
                    price={item.price}
                    isConfirmDisabled={confirmMutation.isPending}
                    onDetail={() => {
                      router.push(ROUTES.CUSTOMER.QUOTE.DETAIL(item.id));
                    }}
                    onConfirm={() => {
                      handleConfirm(item.id);
                    }}
                  />
                </li>
              ))}
            </ul>

            <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

            {quotesQuery.isFetchingNextPage ? (
              <p className="text-md-regular mt-6 text-center text-[var(--content-muted)]">
                {t("loadingMore")}
              </p>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
