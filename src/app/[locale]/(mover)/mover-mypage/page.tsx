import { Suspense } from "react";

import { MoverMyPageContent, MoverMyPageUpdateNotice } from "@/features/mover-mypage/components";

export default function MoverMyPage() {
  return (
    <>
      {/* 안내는 주소의 쿼리를 읽으므로 Suspense로 감싸 마이페이지 본문의 정적 렌더링을 막지 않게 합니다. */}
      <Suspense fallback={null}>
        <MoverMyPageUpdateNotice />
      </Suspense>
      <MoverMyPageContent />
    </>
  );
}
