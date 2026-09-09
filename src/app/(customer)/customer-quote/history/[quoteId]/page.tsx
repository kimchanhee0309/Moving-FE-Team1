import { QUOTE_STATUS } from "@/common/constants/domain";

import { CustomerQuoteDetailView } from "../../[quoteId]/_components/CustomerQuoteDetailView";
import { findHistoryQuoteById } from "../_data/mockHistoryGroups";

interface CustomerQuoteHistoryDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteHistoryDetailPage({
  params,
}: CustomerQuoteHistoryDetailPageProps) {
  const { quoteId } = await params;
  const historyQuote = findHistoryQuoteById(quoteId);

  return (
    <CustomerQuoteDetailView
      quoteId={quoteId}
      status={historyQuote?.status ?? QUOTE_STATUS.PENDING}
      variant="history"
    />
  );
}
