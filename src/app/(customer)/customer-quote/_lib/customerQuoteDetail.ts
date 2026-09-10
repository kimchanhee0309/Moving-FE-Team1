import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

export const DEFAULT_MOVER_PROFILE_IMAGE =
  "/images/customer-quote/mover-profile.png";

/**
 * 견적 상세 화면이 그리는 데이터입니다. 목록 mock·API 응답을 이 형태로
 * 맞춘 뒤 전달합니다. 화면은 이 객체만 읽고 자체 mock을 두지 않습니다.
 */
export interface CustomerQuoteDetail {
  id: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  status: QuoteStatus;
  message: string;
  moverName: string;
  profileImageUrl: string;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
  price: number;
  requestedAt: string;
  serviceLabel: string;
  moveDateLabel: string;
  from: string;
  to: string;
}

/**
 * 대기 중인 견적 상세용 mock입니다. Figma(node 1:9115)는 칩이 소형이사,
 * 견적 정보 서비스는 사무실이사입니다. 대기 목록 API가 붙으면 교체합니다.
 */
export const MOCK_PENDING_QUOTE: CustomerQuoteDetail = {
  id: "1",
  serviceType: SERVICE_TYPE.SMALL,
  isDesignated: true,
  status: QUOTE_STATUS.PENDING,
  message: "고객님의 물품을 안전하게 운송해 드립니다.",
  moverName: "김코드",
  profileImageUrl: DEFAULT_MOVER_PROFILE_IMAGE,
  rating: 5,
  reviewCount: 178,
  careerYears: 7,
  confirmedCount: 334,
  favoriteCount: 136,
  price: 180000,
  requestedAt: "24.08.26",
  serviceLabel: "사무실이사",
  moveDateLabel: "2024. 08. 26(월) 오전 10:00",
  from: "서울 중구 삼일대로 343",
  to: "서울 강남구 선릉로 428",
};
