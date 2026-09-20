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
          "반려 요청을 불러오지 못했습니다.",
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
          "추가 반려 요청을 불러오지 못했습니다. 다시 시도해 주세요.",
        )
      : undefined;

  return (
    <>
      <MoverQuoteTabs value="rejected" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        {rejectedRequestsQuery.isPending ? (
          <LoadingState message="반려 요청을 불러오는 중이에요." />
        ) : initialErrorMessage ? (
          <ErrorState
            title="반려 요청을 불러오지 못했어요."
            description={initialErrorMessage}
            onRetry={() => {
              void rejectedRequestsQuery.refetch();
            }}
          />
        ) : requests.length === 0 ? (
          <EmptyState
            title="반려한 요청이 없어요."
            description="반려한 견적 요청이 이곳에 표시돼요."
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
                  다시 시도
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
