import { MOCK_PENDING_QUOTE } from "../_lib/customerQuoteDetail";
import { CustomerQuoteDetailView } from "./_components/CustomerQuoteDetailView";

interface CustomerQuoteDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteDetailPage({
  params,
}: CustomerQuoteDetailPageProps) {
  const { quoteId } = await params;

  return (
    <CustomerQuoteDetailView
      quote={{ ...MOCK_PENDING_QUOTE, id: quoteId }}
    />
  );
}
