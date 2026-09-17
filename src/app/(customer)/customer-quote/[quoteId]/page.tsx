import { CustomerQuoteDetailContainer } from "./_components/CustomerQuoteDetailContainer";

interface CustomerQuoteDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteDetailPage({
  params,
}: CustomerQuoteDetailPageProps) {
  const { quoteId } = await params;

  return <CustomerQuoteDetailContainer quoteId={quoteId} />;
}
