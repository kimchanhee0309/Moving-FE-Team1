"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/common/components/page-state";
import { ErrorState } from "@/common/components/page-state";
import { LoadingState } from "@/common/components/page-state";
import { SubHeader } from "@/common/components/SubHeader";
import { Tabs } from "@/common/components/Tabs";
import { ROUTES } from "@/common/constants/routes";
import { QuoteCard } from "@/features/customer-quote/components";
import { useCustomerQuoteLoadMoreSentinel } from "@/features/customer-quote/hooks/useCustomerQuoteLoadMoreSentinel";
import {
  useActiveMoveRequestQuery,
  useReceivedQuotesQuery,
} from "@/features/customer-quote/hooks/useCustomerQuoteQueries";

export function CustomerQuoteListView() {
  const router = useRouter();
  const quotesQuery = useReceivedQuotesQuery();
  const moveRequestQuery = useActiveMoveRequestQuery();

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

  return (
    <main className="min-h-screen bg-[var(--background-100)]">
      <h1 className="sr-only">내 견적 관리</h1>
      <Tabs
        ariaLabel="견적 목록"
        value="pending"
        items={[
          {
            id: "pending",
            label: "대기 중인 견적",
            href: ROUTES.CUSTOMER.QUOTE.PENDING,
          },
          {
            id: "history",
            label: "받았던 견적",
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
            이사 요청 정보를 불러오지 못했습니다.
          </p>
          <button
            type="button"
            className="text-md-semibold shrink-0 text-[var(--primary-400)]"
            onClick={() => {
              void moveRequestQuery.refetch();
            }}
          >
            다시 시도
          </button>
        </div>
      ) : null}

      {moveRequest ? (
        <SubHeader
          serviceType={moveRequest.serviceType}
          requestedAt={moveRequest.requestedAt}
          from={moveRequest.from}
          to={moveRequest.to}
          moveDate={moveRequest.moveDate}
        />
      ) : null}

      <section
        aria-label="받은 견적 목록"
        className={[
          "px-6 py-6",
          "min-[744px]:px-[72px] min-[744px]:py-8",
          "min-[1200px]:px-[clamp(72px,18.75vw,360px)] min-[1200px]:py-10",
        ].join(" ")}
      >
        {quotesQuery.isLoading ? (
          <LoadingState message="견적 목록을 불러오는 중..." />
        ) : null}

        {quotesQuery.isError ? (
          <ErrorState
            title="견적 목록을 불러오지 못했습니다"
            description="잠시 후 다시 시도해 주세요."
            onRetry={() => {
              void quotesQuery.refetch();
            }}
          />
        ) : null}

        {!quotesQuery.isLoading &&
        !quotesQuery.isError &&
        quotes.length === 0 ? (
          <EmptyState
            title="대기 중인 견적이 없습니다"
            description="이사 요청 후 기사님의 견적이 도착하면 여기에 표시됩니다."
          />
        ) : null}

        {!quotesQuery.isLoading && !quotesQuery.isError && quotes.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
              {quotes.map((quote) => (
                <li key={quote.id}>
                  <QuoteCard
                    serviceType={quote.serviceType}
                    isDesignated={quote.isDesignated}
                    status={quote.status}
                    message={quote.message}
                    moverName={quote.moverName}
                    moverProfileImageUrl={quote.moverProfileImageUrl}
                    rating={quote.rating}
                    reviewCount={quote.reviewCount}
                    careerYears={quote.careerYears}
                    confirmedCount={quote.confirmedCount}
                    favoriteCount={quote.favoriteCount}
                    price={quote.price}
                    onDetail={() => {
                      router.push(ROUTES.CUSTOMER.QUOTE.DETAIL(quote.id));
                    }}
                  />
                </li>
              ))}
            </ul>

            <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />

            {quotesQuery.isFetchingNextPage ? (
              <p className="text-md-regular mt-6 text-center text-[var(--content-muted)]">
                견적을 더 불러오는 중...
              </p>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
