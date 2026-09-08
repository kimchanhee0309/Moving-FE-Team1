import { MoverQuoteListView } from "@/features/mover-quote/components/MoverQuoteListView";
import { MOCK_MOVER_QUOTES } from "@/features/mover-quote/mover-quote.mock";

export default function MoverQuotePage() {
  return <MoverQuoteListView quotes={MOCK_MOVER_QUOTES} />;
}
