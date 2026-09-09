"use client";

import { useRouter } from "next/navigation";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";

import type { MoverQuoteCardData } from "../mover-quote.types";
import { MoverQuoteCard } from "./MoverQuoteCard";
import { MoverQuoteTabs } from "./MoverQuoteTabs";

interface MoverQuoteListViewProps {
  quotes: MoverQuoteCardData[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function MoverQuoteListView({
  quotes,
  isLoading = false,
  error,
  onRetry,
}: MoverQuoteListViewProps) {
  const router = useRouter();

  return (
    <>
      <MoverQuoteTabs value="sent" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        {isLoading ? (
          <LoadingState message="보낸 견적을 불러오는 중이에요." />
        ) : error ? (
          <ErrorState
            title="보낸 견적을 불러오지 못했어요."
            description={error}
            onRetry={onRetry}
          />
        ) : quotes.length === 0 ? (
          <EmptyState
            title="보낸 견적이 없어요."
            description="받은 요청에서 고객님에게 견적을 보내보세요."
          />
        ) : (
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 items-start gap-6 px-6 py-16 max-lg:grid-cols-1 max-lg:justify-center max-md:max-w-[375px] max-md:gap-5 max-md:py-6">
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
        )}
      </main>
    </>
  );
}
