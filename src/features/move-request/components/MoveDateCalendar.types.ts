/**
 * 외부 캘린더 라이브러리 없이(현재 저장소에 미설치 — 팀 승인 없이 새 의존성을 추가하지 않는다는
 * AGENTS.md 4번 규칙에 따라 직접 구현) 순수 Date 계산만으로 만든 월간 달력 그리드입니다.
 * 로케일/타임존 변환은 하지 않고 브라우저 로컬 시간 기준으로 연/월/일을 비교합니다.
 */
export interface MoveDateCalendarProps {
  /** 현재 선택된 날짜입니다(controlled). 아직 선택 전이면 null입니다. */
  value: Date | null;
  /** 그리드에서 현재 달에 속한 날짜를 클릭했을 때 호출됩니다. 이전/다음 달의 넘침 날짜는 선택할 수 없습니다. */
  onSelect: (date: Date) => void;
  /**
   * 셀 크기 프리셋입니다.
   * Figma 컴포넌트 이름은 `Date picker-Calendar/md`(모바일 전용, 테두리 없이 화면에 바로 삽입,
   * 48px 셀)와 `Date picker-Calendar/sm`(태블릿·데스크톱 Dropdown 패널 안에 테두리·선택완료
   * 버튼과 함께 표시, 40px 셀)로 되어 있는데, 이름의 sm/md가 실제 크기 대소와 반대로 붙어 있어
   * 그대로 옮기면 혼동을 준다(AGENTS.md 4-1번 "variant 이름이 breakpoint/크기를 의미할 수 있다"
   * 항목 참고). 그래서 이 컴포넌트는 실제 셀 한 변의 길이(px)를 값으로 쓴다.
   */
  size?: "48" | "40";
  className?: string;
}
