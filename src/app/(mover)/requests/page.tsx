import { ReceivedRequestsView } from "@/features/mover-requests/components/ReceivedRequestView";
import { MOCK_RECEIVED_REQUESTS } from "@/features/mover-requests/mover-requets.mock";

export default function ReceivedRequestsPage() {
  return <ReceivedRequestsView requests={MOCK_RECEIVED_REQUESTS} />;
}
