"use client";

import { useRouter } from "next/navigation";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { EmptyState } from "@/common/components/page-state";
import { ErrorState } from "@/common/components/page-state";
import { LoadingState } from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";
import {
  useConfirmReceivedQuoteMutation,
  useReceivedQuoteDetailQuery,
} from "@/features/customer-quote/hooks/useCustomerQuoteQueries";

import { CustomerQuoteDetailView } from "./CustomerQuoteDetailView";

interface CustomerQuoteDetailContainerProps {
  quoteId: string;
}

export function CustomerQuoteDetailContainer({
  quoteId,
}: CustomerQuoteDetailContainerProps) {
  const router = useRouter();
  const detailQuery = useReceivedQuoteDetailQuery(quoteId);
  const confirmMutation = useConfirmReceivedQuoteMutation();

  if (detailQuery.isLoading) {
    return (
      <main className="min-h-screen bg-[var(--gray-50)]">
        <LoadingState message="견적 상세를 불러오는 중..." />
      </main>
    );
  }

  if (detailQuery.isError) {
    return (
      <main className="min-h-screen bg-[var(--gray-50)]">
        <ErrorState
          title="견적 상세를 불러오지 못했습니다"
          description="견적이 없거나 접근 권한이 없을 수 있습니다."
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
          title="견적을 찾을 수 없습니다"
          description="삭제되었거나 만료된 견적일 수 있습니다."
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
          ? getApiErrorMessage(
              confirmMutation.error,
              "견적을 확정하지 못했습니다. 다시 시도해 주세요.",
            )
          : null
      }
      onConfirm={() => {
        confirmMutation.mutate(quoteId, {
          onSuccess: (quote) => {
            router.replace(ROUTES.CUSTOMER.QUOTE.HISTORY_DETAIL(quote.id));
          },
        });
      }}
    />
  );
}
