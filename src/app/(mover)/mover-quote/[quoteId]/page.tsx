import { MoverQuoteDetail } from "@/features/mover-quote/components/MoverQuoteDetail";
import { MOCK_MOVER_QUOTE_DETAIL } from "@/features/mover-quote/mover-quote.mock";

interface MoverQuoteDetailPageProps {
  params: Promise<{
    quoteId: string;
  }>;
}

export default async function MoverQuoteDetailPage({
  params,
}: MoverQuoteDetailPageProps) {
  const { quoteId } = await params;

  const quote = {
    ...MOCK_MOVER_QUOTE_DETAIL,
    id: quoteId,
  };

  return <MoverQuoteDetail quote={quote} />;
}
