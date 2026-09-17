import { CustomerQuoteHistoryDetailContainer } from "./_components/CustomerQuoteHistoryDetailContainer";

interface CustomerQuoteHistoryDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteHistoryDetailPage({
  params,
}: CustomerQuoteHistoryDetailPageProps) {
  const { quoteId } = await params;

  return <CustomerQuoteHistoryDetailContainer quoteId={quoteId} />;
}
