"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef } from "react";

import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { EmptyState } from "@/common/components/page-state";
import { ErrorState } from "@/common/components/page-state";
import { LoadingState } from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";
import {
  useConfirmReceivedQuoteMutation,
  useReceivedQuoteDetailQuery,
} from "@/features/customer-quote/hooks/useCustomerQuoteQueries";
import { useRouter } from "@/i18n/navigation";

import { CustomerQuoteDetailView } from "./CustomerQuoteDetailView";

interface CustomerQuoteDetailContainerProps {
  quoteId: string;
}

export function CustomerQuoteDetailContainer({
  quoteId,
}: CustomerQuoteDetailContainerProps) {
  const t = useTranslations("CustomerQuote");
  const apiErrorMessage = useApiErrorMessage();
  const quote = useTranslations("Quote");
  const router = useRouter();
  const detailQuery = useReceivedQuoteDetailQuery(quoteId);
  const confirmMutation = useConfirmReceivedQuoteMutation();
  // isPending 리렌더 전에 연속 클릭되면 mutate가 두 번 호출될 수 있어 동기 잠금으로 막습니다.
  const isConfirmLockedRef = useRef(false);

  const handleConfirm = useCallback(() => {
    if (isConfirmLockedRef.current) {
      return;
    }
    isConfirmLockedRef.current = true;
    confirmMutation.mutate(quoteId, {
      onSuccess: (quote) => {
        router.replace(ROUTES.CUSTOMER.QUOTE.HISTORY_DETAIL(quote.id));
      },
      onSettled: () => {
        isConfirmLockedRef.current = false;
      },
    });
  }, [confirmMutation, quoteId, router]);

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
    <CustomerQuoteDetailView
      quote={detailQuery.data}
      variant="pending"
      isConfirmPending={confirmMutation.isPending}
      confirmError={
        confirmMutation.error
          ? apiErrorMessage(
              confirmMutation.error,
              quote("confirmError"),
            )
          : null
      }
      onConfirm={handleConfirm}
    />
  );
}
