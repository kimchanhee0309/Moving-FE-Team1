import { MoverMyPageView } from "@/features/mover-mypage/components";
import { MOVER_MY_PAGE_PREVIEW } from "@/features/mover-mypage/mover-mypage.preview";
import type { MoverMyPageViewState } from "@/features/mover-mypage/mover-mypage.types";

const VIEW_STATES: ReadonlyArray<MoverMyPageViewState> = ["ready", "loading", "error", "empty"];

/** `?view=`는 API 연결 전 normal/loading/error/empty UI를 검수하기 위한 임시 표시 상태입니다. */
export default async function MoverMyPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const requestedView = (await searchParams).view;
  const viewState = VIEW_STATES.find((state) => state === requestedView) ?? "ready";

  return <MoverMyPageView data={MOVER_MY_PAGE_PREVIEW} viewState={viewState} />;
}
