import { notFound } from "next/navigation";

import { MoverQuoteDetail } from "@/features/mover-quote/components/MoverQuoteDetail";
import {
  MOCK_MOVER_QUOTE_DETAIL,
  MOCK_MOVER_QUOTES,
} from "@/features/mover-quote/mover-quote.mock";

import type { MoverQuoteDetailData } from "@/features/mover-quote/mover-quote.types";

interface MoverQuoteDetailPageProps {
  params: Promise<{
    quoteId: string;
  }>;
}

export default async function MoverQuoteDetailPage({
  params,
}: MoverQuoteDetailPageProps) {
  const { quoteId } = await params;

  if (quoteId === MOCK_MOVER_QUOTE_DETAIL.id) {
    return <MoverQuoteDetail quote={MOCK_MOVER_QUOTE_DETAIL} />;
  }

  const quoteSummary = MOCK_MOVER_QUOTES.find((quote) => quote.id === quoteId);

  if (!quoteSummary) {
    notFound();
  }

  const quote: MoverQuoteDetailData = {
    ...quoteSummary,
    requestedAt: "24.08.26",
  };

  return <MoverQuoteDetail quote={quote} />;
}
