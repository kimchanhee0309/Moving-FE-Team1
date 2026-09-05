import type { AddressResult } from "@/common/components/AddressCard";

export type { AddressResult };

export interface AddressSearchModalProps {
  /** 모달 표시 여부입니다(controlled). */
  isOpen: boolean;
  /**
   * 모달 제목입니다. 견적 요청 흐름에서는 "출발지를 선택해주세요" /
   * "도착지를 선택해주세요"처럼 호출부가 문맥에 맞는 문구를 전달합니다.
   */
  title: string;
  /** 검색 input의 현재 값입니다(controlled). */
  searchValue: string;
  /**
   * 검색어가 바뀔 때 호출됩니다. 이 컴포넌트는 카카오 우편번호 API를 직접 호출하지
   * 않으므로, 실제 검색 요청과 디바운스는 호출자(추후 adapter/hook)가 담당합니다.
   */
  onSearchChange: (value: string) => void;
  /** 검색어 지우기 버튼을 눌렀을 때 호출됩니다. */
  onSearchClear: () => void;
  /**
   * 검색 결과 목록입니다. 데이터 소스(카카오 우편번호 API 등)는 이 컴포넌트가 모르며
   * 항상 부모가 채워 넣는 controlled 배열입니다.
   */
  results: AddressResult[];
  /** 검색 요청이 진행 중이면 결과 영역에 로딩 상태를 표시합니다. */
  isLoading?: boolean;
  /** 현재 선택된 주소입니다. 선택 전이면 null입니다. */
  selectedAddress: AddressResult | null;
  /** 검색 결과 카드를 클릭했을 때 호출됩니다. */
  onSelectAddress: (address: AddressResult) => void;
  /**
   * "선택완료" 버튼을 눌렀을 때 호출됩니다.
   * selectedAddress가 없으면 버튼이 disabled 상태라 호출되지 않습니다.
   */
  onConfirm: (address: AddressResult) => void;
  /** 닫기 버튼, Esc, backdrop 클릭으로 모달을 닫을 때 호출됩니다. */
  onClose: () => void;
  /** 검색 input의 placeholder입니다. 기본값은 Figma 문구("텍스트를 입력해 주세요.")입니다. */
  searchPlaceholder?: string;
  /** 최상위 dialog panel에 추가할 클래스입니다. */
  className?: string;
}
