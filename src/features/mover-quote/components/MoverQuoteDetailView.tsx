"use client";

/**
 * 견적 상세 Query의 상태를 실제 상세 UI와 연결
 *
 * 상세 표현은 MoverQuoteDetail에 위임하고,
 * 이 컴포넌트는 loading/error/not-found/success 분기만 담당
 */
import { useTranslations } from "next-intl";

import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { ErrorState, LoadingState } from "@/common/components/page-state";

import { useMoverQuoteDetail } from "../mover-quote.hooks";
import { MoverQuoteDetail } from "./MoverQuoteDetail";

interface MoverQuoteDetailViewProps {
  quoteId: string;
}

export function MoverQuoteDetailView({ quoteId }: MoverQuoteDetailViewProps) {
  const t = useTranslations("MoverQuote");
  const apiErrorMessage = useApiErrorMessage();
  const quoteQuery = useMoverQuoteDetail(quoteId);

  if (quoteQuery.isPending) {
    return <LoadingState message={t("detailLoading")} />;
  }

  if (quoteQuery.error) {
    return (
      <ErrorState
        title={t("detailLoadErrorTitle")}
        description={apiErrorMessage(
          quoteQuery.error,
          t("detailLoadError"),
        )}
        onRetry={() => {
          void quoteQuery.refetch();
        }}
      />
    );
  }

  /**
   * 요청은 성공했지만 data가 없는 비정상적인 상태도 별도 오류 화면으로
   * 처리하여 빈 화면이 나타나지 않게 함
   */
  if (!quoteQuery.data) {
    return (
      <ErrorState
        title={t("detailNotFound")}
        description={t("detailNotFoundDescription")}
      />
    );
  }

  return <MoverQuoteDetail quote={quoteQuery.data} />;
}
