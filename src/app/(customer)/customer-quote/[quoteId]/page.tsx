import { HydrationBoundary } from "@tanstack/react-query";

import { prefetchReceivedQuoteDetail } from "@/features/customer-quote/api/customer-quote.server";

import { CustomerQuoteDetailContainer } from "./_components/CustomerQuoteDetailContainer";

interface CustomerQuoteDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteDetailPage({
  params,
}: CustomerQuoteDetailPageProps) {
  const { quoteId } = await params;
  const dehydratedState = await prefetchReceivedQuoteDetail(quoteId);

  return (
    <HydrationBoundary state={dehydratedState}>
      <CustomerQuoteDetailContainer quoteId={quoteId} />
    </HydrationBoundary>
  );
}
