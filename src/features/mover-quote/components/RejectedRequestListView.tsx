"use client";

import { getApiErrorMessage } from "@/common/api/get-error-message";
import { Button } from "@/common/components/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";

import { useRejectedRequests } from "../mover-quote-hooks";
import { MoverQuoteTabs } from "./MoverQuoteTabs";
import { RejectedRequestCard } from "./RejectedRequestCard";

export function RejectedRequestListView() {
  const rejectedRequestsQuery = useRejectedRequests();

  const requests =
    rejectedRequestsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const errorMessage = rejectedRequestsQuery.error
    ? getApiErrorMessage(
        rejectedRequestsQuery.error,
        "반려 요청을 불러오지 못했습니다.",
      )
    : undefined;

  return (
    <>
      <MoverQuoteTabs value="rejected" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        {rejectedRequestsQuery.isPending ? (
          <LoadingState message="반려 요청을 불러오는 중이에요." />
        ) : errorMessage ? (
          <ErrorState
            title="반려 요청을 불러오지 못했어요."
            description={errorMessage}
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

            {rejectedRequestsQuery.hasNextPage ? (
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
                  더보기
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
