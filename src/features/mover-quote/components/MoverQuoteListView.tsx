"use client";

import { useRouter } from "next/navigation";

import { ROUTES } from "@/common/constants/routes";

import type { MoverQuoteCardData } from "../mover-quote.types";
import { MoverQuoteCard } from "./MoverQuoteCard";
import { MoverQuoteTabs } from "./MoverQuoteTabs";

interface MoverQuoteListViewProps {
  quotes: MoverQuoteCardData[];
}

export function MoverQuoteListView({ quotes }: MoverQuoteListViewProps) {
  const router = useRouter();

  return (
    <>
      <MoverQuoteTabs value="sent" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-6 px-6 py-16 max-lg:grid-cols-1 max-lg:justify-items-center max-md:max-w-[375px] max-md:gap-5 max-md:py-6">
          {quotes.map((quote) => (
            <MoverQuoteCard
              key={quote.id}
              quote={quote}
              onDetailClick={(quoteId) =>
                router.push(ROUTES.MOVER.QUOTE.DETAIL(quoteId))
              }
            />
          ))}
        </div>
      </main>
    </>
  );
}
