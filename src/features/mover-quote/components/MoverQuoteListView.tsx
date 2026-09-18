"use client";

import { useRouter } from "next/navigation";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { Button } from "@/common/components/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";

import { useMoverQuotes } from "../mover-quote-hooks";
import { MoverQuoteCard } from "./MoverQuoteCard";
import { MoverQuoteTabs } from "./MoverQuoteTabs";

export function MoverQuoteListView() {
  const router = useRouter();
  const quotesQuery = useMoverQuotes();

  const quotes = quotesQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const errorMessage = quotesQuery.error
    ? getApiErrorMessage(quotesQuery.error, "보낸 견적을 불러오지 못했습니다.")
    : undefined;

  return (
    <>
      <MoverQuoteTabs value="sent" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        {quotesQuery.isPending ? (
          <LoadingState message="보낸 견적을 불러오는 중이에요." />
        ) : errorMessage ? (
          <ErrorState
            title="보낸 견적을 불러오지 못했어요."
            description={errorMessage}
            onRetry={() => {
              void quotesQuery.refetch();
            }}
          />
        ) : quotes.length === 0 ? (
          <EmptyState
            title="보낸 견적이 없어요."
            description="받은 요청에서 고객님에게 견적을 보내보세요."
          />
        ) : (
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-16 max-[743px]:max-w-[375px] max-[743px]:py-6">
            <div className="grid grid-cols-1 items-start justify-items-center gap-6 min-[1200px]:grid-cols-2">
              {quotes.map((quote) => (
                <MoverQuoteCard
                  key={quote.id}
                  quote={quote}
                  onDetailClick={(quoteId) =>
                    router.push(ROUTES.MOVER.QUOTE.DETAIL(quoteId))
                  }
                />
              ))}
            </div>

            {quotesQuery.hasNextPage ? (
              <div className="flex justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outlined"
                  isLoading={quotesQuery.isFetchingNextPage}
                  onClick={() => {
                    void quotesQuery.fetchNextPage();
                  }}
                >
                  더 보기
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
