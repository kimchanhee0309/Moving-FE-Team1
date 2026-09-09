import { MoveRequestBlockedState } from "@/app/(customer)/move-request/_components/MoveRequestBlockedState";

/**
 * QA 전용 미리보기 페이지입니다. `/move-request`는 아직 활성 요청 여부를 판단하는 API가 없어
 * 실제 화면에서 이 상태를 재현할 수 없으므로, 로그인/AuthGuard 없이 바로 확인할 수 있도록
 * `(public)/component-example` 아래에 임시로 둔다. 실제 API 연동 후 `/move-request`에서
 * 조건부로 보이게 되면 이 preview 라우트는 정리 대상이다.
 */
export default function MoveRequestBlockedExamplePage() {
  return <MoveRequestBlockedState />;
}
