import type { ServiceType } from "@/common/constants/domain";
import { SERVICE_TYPE } from "@/common/constants/domain";

/** 찜 목록 mock용 기사님 카드 데이터 (API DTO 확정 전) */
export interface FavoriteMover {
  id: string;
  serviceType: ServiceType;
  moverName: string;
  introduction: string;
  description: string;
  profileImageUrl?: string | null;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
}

/** API 연동 전 로컬 확인용 mock. 서버 응답과 다를 수 있다. */
export const MOCK_FAVORITE_MOVERS: FavoriteMover[] = [
  {
    id: "mover-1",
    serviceType: SERVICE_TYPE.SMALL,
    moverName: "김코드",
    introduction: "고객님의 물품을 안전하게 운송해 드립니다.",
    description: "이사 업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다.",
    rating: 5,
    reviewCount: 178,
    careerYears: 7,
    confirmedCount: 334,
    favoriteCount: 136,
  },
  {
    id: "mover-2",
    serviceType: SERVICE_TYPE.HOME,
    moverName: "이안전",
    introduction: "꼼꼼한 포장과 신속한 이동을 약속드립니다.",
    description: "가정이사 전문, 파손 없는 이사를 최우선으로 합니다.",
    rating: 4.9,
    reviewCount: 92,
    careerYears: 5,
    confirmedCount: 210,
    favoriteCount: 88,
  },
  {
    id: "mover-3",
    serviceType: SERVICE_TYPE.OFFICE,
    moverName: "박신속",
    introduction: "사무실 이전도 일정에 맞춰 정확하게.",
    description: "사무실·상가 이사 다수 진행 경험으로 빠른 세팅을 도와드립니다.",
    rating: 4.8,
    reviewCount: 64,
    careerYears: 9,
    confirmedCount: 152,
    favoriteCount: 71,
  },
  {
    id: "mover-4",
    serviceType: SERVICE_TYPE.SMALL,
    moverName: "최친절",
    introduction: "작은 짐도 정성껏, 부담 없이 맡겨 주세요.",
    description: "원룸·소형 이사에 특화된 서비스로 합리적인 견적을 제공합니다.",
    rating: 5,
    reviewCount: 41,
    careerYears: 3,
    confirmedCount: 98,
    favoriteCount: 45,
  },
];
