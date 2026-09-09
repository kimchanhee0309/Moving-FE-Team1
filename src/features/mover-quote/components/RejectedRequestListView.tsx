import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/common/components/page-state";

import type { RejectedRequestCardData } from "../mover-quote.types";
import { MoverQuoteTabs } from "./MoverQuoteTabs";
import { RejectedRequestCard } from "./RejectedRequestCard";

interface RejectedRequestListViewProps {
  requests: RejectedRequestCardData[];
  isLoading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export function RejectedRequestListView({
  requests,
  isLoading = false,
  error,
  onRetry,
}: RejectedRequestListViewProps) {
  return (
    <>
      <MoverQuoteTabs value="rejected" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        {isLoading ? (
          <LoadingState message="반려 요청을 불러오는 중이에요." />
        ) : error ? (
          <ErrorState
            title="반려 요청을 불러오지 못했어요."
            description={error}
            onRetry={onRetry}
          />
        ) : requests.length === 0 ? (
          <EmptyState
            title="반려한 요청이 없어요."
            description="반려한 견적 요청이 이곳에 표시돼요."
          />
        ) : (
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 items-start gap-6 px-6 py-16 max-lg:grid-cols-1 max-lg:justify-items-center max-md:max-w-[375px] max-md:gap-5 max-md:py-6">
            {requests.map((request) => (
              <RejectedRequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
