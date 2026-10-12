import type { ComponentType } from "react";

/** URL 기반 모달(`?modal=` 쿼리)로 열리는 컴포넌트가 공통으로 받는 props입니다. */
export interface UrlModalComponentProps {
  /** 닫기 버튼/완료 등에서 호출한다. 호출하면 URL의 `modal` 쿼리가 제거되며 모달이 닫힌다. */
  onClose: () => void;
}

/**
 * `?modal=이름` 쿼리로 열 수 있는 모달 목록입니다. 새로고침해도 유지되거나 링크로 공유해야 하는
 * 모달만 여기 등록합니다 — 그 외(일반 확인창, 폼 입력 등)는 `useModal().openModal`(state 기반)을
 * 사용하세요.
 *
 * 추가 방법:
 * 1. `src/features/{feature}/components/`에 모달 컴포넌트를 만들고 `UrlModalComponentProps`를
 *    받도록 한다(제목·닫기 버튼 등 모달 내용 전체를 컴포넌트가 직접 그린다).
 * 2. 아래 객체에 `쿼리에 쓸 이름: 컴포넌트`로 등록한다.
 * 3. `?modal=쿼리에 쓸 이름`으로 열 수 있다.
 *
 * 아직 이 방식으로 전환할 모달이 없어 비어 있습니다 — 필요할 때만 추가하세요(AGENTS.md 6번:
 * "목록은 미리 전부 구현하라는 의미가 아니다").
 */
export const MODAL_COMPONENTS: Record<string, ComponentType<UrlModalComponentProps>> = {};
