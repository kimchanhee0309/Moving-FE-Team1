"use client";

import { useTranslations } from "next-intl";

import { EmptyState } from "@/common/components/page-state";
import { ErrorState } from "@/common/components/page-state";
import { LoadingState } from "@/common/components/page-state";
import { useReceivedQuoteHistoryDetailQuery } from "@/features/customer-quote/hooks/useCustomerQuoteQueries";

import { CustomerQuoteDetailView } from "../../../[quoteId]/_components/CustomerQuoteDetailView";

interface CustomerQuoteHistoryDetailContainerProps {
  quoteId: string;
}

export function CustomerQuoteHistoryDetailContainer({
  quoteId,
}: CustomerQuoteHistoryDetailContainerProps) {
  const t = useTranslations("CustomerQuote");
  const detailQuery = useReceivedQuoteHistoryDetailQuery(quoteId);

  if (detailQuery.isLoading) {
    return (
      <main className="min-h-screen bg-[var(--gray-50)]">
        <LoadingState message={t("detailLoading")} />
      </main>
    );
  }

  if (detailQuery.isError) {
    return (
      <main className="min-h-screen bg-[var(--gray-50)]">
        <ErrorState
          title={t("detailLoadError")}
          description={t("detailLoadErrorDescription")}
          onRetry={() => {
            void detailQuery.refetch();
          }}
        />
      </main>
    );
  }

  if (!detailQuery.data) {
    return (
      <main className="min-h-screen bg-[var(--gray-50)]">
        <EmptyState
          title={t("detailEmpty")}
          description={t("detailEmptyDescription")}
        />
      </main>
    );
  }

  return (
    <CustomerQuoteDetailView quote={detailQuery.data} variant="history" />
  );
}
