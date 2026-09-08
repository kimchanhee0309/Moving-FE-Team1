import type { RejectedRequestCardData } from "../mover-quote.types";
import { MoverQuoteTabs } from "./MoverQuoteTabs";
import { RejectedRequestCard } from "./RejectedRequestCard";

interface RejectedRequestListViewProps {
  requests: RejectedRequestCardData[];
}

export function RejectedRequestListView({
  requests,
}: RejectedRequestListViewProps) {
  return (
    <>
      <MoverQuoteTabs value="rejected" />

      <main className="min-h-[calc(100vh-142px)] bg-[var(--background-100)]">
        <div className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-6 px-6 py-16 max-lg:grid-cols-1 max-lg:justify-items-center max-md:max-w-[375px] max-md:py-6">
          {requests.map((request) => (
            <RejectedRequestCard key={request.id} request={request} />
          ))}
        </div>
      </main>
    </>
  );
}
