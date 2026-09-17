import { HydrationBoundary } from "@tanstack/react-query";

import { prefetchReceivedQuoteHistoryDetail } from "@/features/customer-quote/api/customer-quote.server";

import { CustomerQuoteHistoryDetailContainer } from "./_components/CustomerQuoteHistoryDetailContainer";

interface CustomerQuoteHistoryDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteHistoryDetailPage({
  params,
}: CustomerQuoteHistoryDetailPageProps) {
  const { quoteId } = await params;
  const dehydratedState = await prefetchReceivedQuoteHistoryDetail(quoteId);

  return (
    <HydrationBoundary state={dehydratedState}>
      <CustomerQuoteHistoryDetailContainer quoteId={quoteId} />
    </HydrationBoundary>
  );
}
