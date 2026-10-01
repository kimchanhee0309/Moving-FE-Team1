"use client";

import { useState } from "react";

import { MOVE_REQUEST_STATUS, SERVICE_TYPE } from "@/common/constants/domain";
import type { MoveRequestDto } from "@/features/move-request/move-request.types";

import { MoveRequestBlockedState } from "@/app/[locale]/(customer)/move-request/_components/MoveRequestBlockedState";

/**
 * QA 전용 미리보기 페이지입니다. `MoveRequestBlockedState`가 이제 활성 요청(`MoveRequestDto`)과
 * "수정하기" 콜백을 필수 props로 받게 되어(이 저장소 견적 요청 수정/삭제 기능 추가), 로그인 없이
 * 카드/버튼 레이아웃만 확인할 수 있도록 목 데이터를 직접 채워서 렌더링한다. 실제 API 연동 후에도
 * `/move-request`에서 조건부로 보이므로 이 preview 라우트는 계속 정리 대상이다.
 */
const MOCK_ACTIVE_MOVE_REQUEST: MoveRequestDto = {
  id: "preview-move-request",
  serviceType: SERVICE_TYPE.HOME,
  moveDate: new Date().toISOString(),
  fromAddress: "[06236] 테헤란로 123 (역삼동)",
  toAddress: "[04524] 세종대로 110 (태평로1가)",
  status: MOVE_REQUEST_STATUS.WAITING,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function MoveRequestBlockedExamplePage() {
  const [editClickCount, setEditClickCount] = useState(0);

  return (
    <>
      <MoveRequestBlockedState
        moveRequest={MOCK_ACTIVE_MOVE_REQUEST}
        onEditRequest={() => setEditClickCount((count) => count + 1)}
      />
      {editClickCount > 0 ? (
        <p className="p-4 text-center text-sm-medium text-(--gray-500)">
          &ldquo;수정하기&rdquo;가 {editClickCount}번 클릭됐어요(QA 전용 표시 — 실제 수정 폼 전환은
          /move-request에서 확인).
        </p>
      ) : null}
    </>
  );
}
