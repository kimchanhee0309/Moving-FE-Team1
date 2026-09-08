import { RejectedRequestListView } from "@/features/mover-quote/components/RejectedRequestListView";
import { MOCK_REJECTED_REQUESTS } from "@/features/mover-quote/mover-quote.mock";

export default function RejectedRequestsPage() {
  return <RejectedRequestListView requests={MOCK_REJECTED_REQUESTS} />;
}
