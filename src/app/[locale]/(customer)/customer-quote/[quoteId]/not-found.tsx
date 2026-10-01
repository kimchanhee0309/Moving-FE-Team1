import Link from "next/link";

import { EmptyState } from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";

export default function PendingQuoteNotFound() {
  return (
    <EmptyState
      title="견적을 찾을 수 없어요."
      description="없거나 삭제된 대기 견적입니다."
      action={
        <Link href={ROUTES.CUSTOMER.QUOTE.PENDING}>대기 중인 견적 목록으로</Link>
      }
    />
  );
}
