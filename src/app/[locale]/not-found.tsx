import Link from "next/link";

import { EmptyState } from "@/common/components/page-state";
import { ROUTES } from "@/common/constants/routes";

export default function NotFound() {
  return (
    <EmptyState
      title="페이지를 찾을 수 없어요."
      description="주소가 잘못되었거나 삭제된 페이지입니다."
      action={<Link href={ROUTES.HOME}>홈으로 돌아가기</Link>}
    />
  );
}
