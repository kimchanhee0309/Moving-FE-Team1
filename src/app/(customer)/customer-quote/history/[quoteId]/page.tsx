import { notFound } from "next/navigation";

import { CustomerQuoteDetailView } from "../../[quoteId]/_components/CustomerQuoteDetailView";
import {
  findHistoryQuoteById,
  toCustomerQuoteDetail,
} from "../_data/mockHistoryGroups";

interface CustomerQuoteHistoryDetailPageProps {
  params: Promise<{ quoteId: string }>;
}

export default async function CustomerQuoteHistoryDetailPage({
  params,
}: CustomerQuoteHistoryDetailPageProps) {
  const { quoteId } = await params;
  const found = findHistoryQuoteById(quoteId);

  if (!found) {
    notFound();
  }

  return (
    <CustomerQuoteDetailView
      quote={toCustomerQuoteDetail(found)}
      variant="history"
    />
  );
}
