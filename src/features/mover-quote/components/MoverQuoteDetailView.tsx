"use client";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { ErrorState, LoadingState } from "@/common/components/page-state";

import { useMoverQuoteDetail } from "../mover-quote-hooks";
import { MoverQuoteDetail } from "./MoverQuoteDetail";

interface MoverQuoteDetailViewProps {
  quoteId: string;
}

export function MoverQuoteDetailView({ quoteId }: MoverQuoteDetailViewProps) {
  const quoteQuery = useMoverQuoteDetail(quoteId);

  if (quoteQuery.isPending) {
    return <LoadingState message="견적 상세를 불러오는 중이에요." />;
  }

  if (quoteQuery.error) {
    return (
      <ErrorState
        title="견적 상세를 불러오지 못했어요."
        description={getApiErrorMessage(
          quoteQuery.error,
          "견적 상세를 불러오지 못했습니다.",
        )}
        onRetry={() => {
          void quoteQuery.refetch();
        }}
      />
    );
  }

  if (!quoteQuery.data) {
    return (
      <ErrorState
        title="견적을 찾을 수 없어요."
        description="삭제되었거나 접근할 수 없는 견적입니다."
      />
    );
  }

  return <MoverQuoteDetail quote={quoteQuery.data} />;
}
