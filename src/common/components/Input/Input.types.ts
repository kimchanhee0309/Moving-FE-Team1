/**
 * 모든 공통 form field가 접근 가능한 이름을 갖도록 제한하는 공용 타입입니다.
 * 화면에 label을 표시하지 않는 디자인일 때만 aria-label을 필수로 요구합니다.
 */
export type AccessibleFieldLabelProps =
  | {
      label: string;
      "aria-label"?: string;
    }
  | {
      label?: undefined;
      "aria-label": string;
    };
