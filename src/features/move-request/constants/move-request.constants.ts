/**
 * `useActiveMoveRequest`/`useCreateMoveRequest`(hooks/useMoveRequest.ts) query key factory입니다.
 * 지금은 "활성 견적 요청 단건 조회" 키 하나뿐이지만, 다른 feature의 factory 패턴
 * (`mover-search.constants.ts`의 `moverSearchQueryKeys`, 이 폴더의 `addressSearchKeys`)과 동일하게
 * `all`을 루트로 두고 세부 키를 파생시키는 구조로 만들어, 나중에 견적 요청 목록/상세 등이
 * 추가돼도 무효화 범위를 `moveRequestKeys.all`로 넓게 잡거나 특정 키만 좁게 잡을 수 있게 한다.
 */
export const moveRequestKeys = {
  all: ["move-request"] as const,
  active: () => [...moveRequestKeys.all, "active"] as const,
};
