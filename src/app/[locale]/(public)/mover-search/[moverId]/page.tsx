import { MoverSearchDetailPageContent } from "@/features/mover-search/components/MoverSearchDetailPageContent";

interface MoverSearchDetailPageProps {
  params: Promise<{ moverId: string }>;
  searchParams: Promise<{ quote?: string | string[] }>;
}

export default async function MoverSearchDetailPage({
  params,
  searchParams,
}: MoverSearchDetailPageProps) {
  const { moverId } = await params;
  const query = await searchParams;
  const quoteParam = Array.isArray(query.quote) ? query.quote[0] : query.quote;

  return (
    <MoverSearchDetailPageContent
      moverId={moverId}
      mockHasGeneralQuote={quoteParam === "1"}
    />
  );
}
