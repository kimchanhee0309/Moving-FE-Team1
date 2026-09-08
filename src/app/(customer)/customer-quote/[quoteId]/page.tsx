import { CustomerQuoteDetailView } from "./_components/CustomerQuoteDetailView";

interface CustomerQuoteDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteDetailPage({
  params,
}: CustomerQuoteDetailPageProps) {
  const { quoteId } = await params;

  return <CustomerQuoteDetailView quoteId={quoteId} />;
}
