import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

export const DEFAULT_MOVER_PROFILE_IMAGE =
  "/images/customer-quote/mover-profile.png";

/**
 * 견적 상세 화면 모델. API mapper 결과를 이 형태로 맞춥니다.
 * 날짜·라벨은 locale마다 달라 ISO 원문과 enum으로 두고, 화면에서 번역·포맷합니다.
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
  /** ISO 문자열 */
  moveDate: string;
  from: string;
  to: string;
}
