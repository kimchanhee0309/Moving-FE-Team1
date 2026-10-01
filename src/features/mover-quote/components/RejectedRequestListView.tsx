"use client";

/**
 * 기사님이 직접 반려한 요청 목록 페이지 상태를 조합합니다.
 *
 * 담당 기능:
 * - 반려 목록 Infinite Query 실행
 * - 페이지 데이터 병합
 * - loading/error/empty/success 상태 표시
 * - 다음 페이지 조회
 */

import { useTranslations } from "next-intl";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { Button } from "@/common/components/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";

import { useRejectedRequests } from "../mover-quote.hooks";
import { MoverQuoteTabs } from "./MoverQuoteTabs";
import { RejectedRequestCard } from "./RejectedRequestCard";

export function RejectedRequestListView() {
  const t = useTranslations("MoverQuote");
  const common = useTranslations("Common");
  const rejectedRequestsQuery = useRejectedRequests();

  const requests =
    rejectedRequestsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const hasLoadedRequests = requests.length > 0;

  /**
   * 첫 조회가 실패해서 표시할 기존 카드가 없을 때만 전체 오류 화면을
   * 표시합니다.
   */
  const initialErrorMessage =
    rejectedRequestsQuery.isError &&
    !hasLoadedRequests &&
    rejectedRequestsQuery.error
      ? getApiErrorMessage(
          rejectedRequestsQuery.error,
          t("rejectedLoadError"),
        )
      : undefined;

  /**
   * 추가 페이지 요청이 실패해도 이미 불러온 카드는 유지하고,
   * 목록 아래에서 추가 요청만 다시 실행할 수 있게 합니다.
   */
  const loadMoreErrorMessage =
    rejectedRequestsQuery.isFetchNextPageError && rejectedRequestsQuery.error
      ? getApiErrorMessage(
          rejectedRequestsQuery.error,
          t("rejectedLoadMoreError"),
        )
      : undefined;

  return (
    <>
      <MoverQuoteTabs value="rejected" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        {rejectedRequestsQuery.isPending ? (
          <LoadingState message={t("rejectedLoading")} />
        ) : initialErrorMessage ? (
          <ErrorState
            title={t("rejectedLoadErrorTitle")}
            description={initialErrorMessage}
            onRetry={() => {
              void rejectedRequestsQuery.refetch();
            }}
          />
        ) : requests.length === 0 ? (
          <EmptyState
            title={t("rejectedEmpty")}
            description={t("rejectedEmptyDescription")}
          />
        ) : (
          <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-16 max-[743px]:max-w-[375px] max-[743px]:py-6">
            <div className="grid grid-cols-1 items-start justify-items-center gap-6 min-[1200px]:grid-cols-2">
              {requests.map((request) => (
                <RejectedRequestCard key={request.id} request={request} />
              ))}
            </div>

            {loadMoreErrorMessage ? (
              <div
                role="alert"
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--primary-200)] bg-[var(--primary-100)] px-6 py-5 text-center"
              >
                <p className="text-[14px] font-medium leading-6 text-[var(--primary-400)]">
                  {loadMoreErrorMessage}
                </p>

                <Button
                  type="button"
                  size="sm"
                  variant="outlined"
                  isLoading={rejectedRequestsQuery.isFetchingNextPage}
                  onClick={() => {
                    void rejectedRequestsQuery.fetchNextPage();
                  }}
                >
                  {common("retry")}
                </Button>
              </div>
            ) : rejectedRequestsQuery.hasNextPage ? (
              <div className="flex justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outlined"
                  isLoading={rejectedRequestsQuery.isFetchingNextPage}
                  onClick={() => {
                    void rejectedRequestsQuery.fetchNextPage();
                  }}
                >
                  {t("more")}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
