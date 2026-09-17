import { SERVICE_TYPE } from "@/common/constants/domain";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

export const DEFAULT_MOVER_PROFILE_IMAGE =
  "/images/customer-quote/mover-profile.png";

/** 견적 상세 화면 모델. API mapper 결과를 이 형태로 맞춥니다. */
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
