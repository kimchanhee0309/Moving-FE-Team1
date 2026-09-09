import { CustomerQuoteDetailView } from "../../[quoteId]/_components/CustomerQuoteDetailView";

interface CustomerQuoteHistoryDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteHistoryDetailPage({
  params,
}: CustomerQuoteHistoryDetailPageProps) {
  const { quoteId } = await params;

  return <CustomerQuoteDetailView quoteId={quoteId} variant="confirmed" />;
}
