/**
 * 기사님 견적 관리 화면에서 사용하는 표시용 상수
 *
 * 서버 enum 자체는 common/constants/domain에서 관리하고,
 * 이 파일에서는 화면에 표시할 한국어 문구만 관리함
 */
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

/** 백엔드 서비스 유형 enum과 화면 표시 문구의 매핑 */
export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};
