import { MoverQuoteDetailView } from "@/features/mover-quote/components/MoverQuoteDetailView";

interface MoverQuoteDetailPageProps {
  params: Promise<{
    quoteId: string;
  }>;
}

export default async function MoverQuoteDetailPage({
  params,
}: MoverQuoteDetailPageProps) {
  const { quoteId } = await params;

  return <MoverQuoteDetailView quoteId={quoteId} />;
}
