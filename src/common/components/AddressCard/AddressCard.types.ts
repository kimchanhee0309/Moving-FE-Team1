/**
 * 카카오 우편번호(Daum Postcode) 검색 결과 한 건을 표현하는 주소 데이터입니다.
 * 필드명은 카카오 우편번호 서비스의 응답 필드(zonecode, roadAddress, jibunAddress)를
 * 그대로 따릅니다. 실제 API/SDK 연동은 이 컴포넌트가 소유하지 않으며,
 * 추후 검색 결과를 이 타입으로 변환하는 adapter에서 매핑합니다.
 */
export interface AddressResult {
  /** 5자리 우편번호. 예: "04538" */
  zonecode: string;
  /** 도로명 주소 전체 문자열 */
  roadAddress: string;
  /** 지번 주소 전체 문자열 */
  jibunAddress: string;
}

export interface AddressCardProps {
  /** 카드에 표시할 주소 데이터입니다. */
  address: AddressResult;
  /**
   * 현재 선택된 카드인지 여부입니다(Figma의 state=active).
   * 값 자체는 부모(AddressSearchModal 등)가 controlled로 관리합니다.
   */
  selected?: boolean;
  /**
   * 카드를 클릭하거나 Enter/Space로 활성화했을 때 호출됩니다.
   * 선택 상태 반영은 호출자가 selected prop을 갱신하는 방식으로 담당합니다.
   */
  onSelect?: (address: AddressResult) => void;
  /** 최상위 button 요소에 추가할 클래스입니다. */
  className?: string;
}
