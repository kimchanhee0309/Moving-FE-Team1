import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

export const WRITABLE_REVIEW_PAGE_SIZE = 4;

export interface WritableReviewItem {
  id: string;
  moverName: string;
  moverIntroduction: string;
  profileImageUrl?: string | null;
  serviceType: ServiceType;
  isDesignatedRequest?: boolean;
  departure: string;
  arrival: string;
  movedAt: string;
  price: number;
}

const BASE_ITEMS: Omit<WritableReviewItem, "id">[] = [
  {
    moverName: "김코드",
    moverIntroduction:
      "이사업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다.",
    serviceType: SERVICE_TYPE.SMALL,
    departure: "서울시 중구",
    arrival: "경기도 수원시",
    // 날짜만 쓰면 UTC로 파싱되어 서쪽 타임존에서 하루 밀림 → 로컬 자정 명시
    movedAt: "2024-07-01T00:00:00",
    price: 180_000,
  },
  {
    moverName: "이무빙",
    moverIntroduction: "꼼꼼한 포장과 안전한 운송을 약속드립니다.",
    serviceType: SERVICE_TYPE.HOME,
    isDesignatedRequest: true,
    departure: "서울시 강남구",
    arrival: "인천시 연수구",
    movedAt: "2024-07-03T00:00:00",
    price: 320_000,
  },
  {
    moverName: "박이사",
    moverIntroduction: "사무실 이사 전문, 당일 견적·당일 이동 가능합니다.",
    serviceType: SERVICE_TYPE.OFFICE,
    departure: "경기도 성남시",
    arrival: "서울시 마포구",
    movedAt: "2024-07-05T00:00:00",
    price: 450_000,
  },
  {
    moverName: "최안전",
    moverIntroduction: "파손 없는 이사를 최우선으로 생각합니다.",
    serviceType: SERVICE_TYPE.SMALL,
    departure: "서울시 송파구",
    arrival: "경기도 고양시",
    movedAt: "2024-07-08T00:00:00",
    price: 210_000,
  },
];

// pageSize 4 기준 1페이지 + 여분 1건 → pagination·empty 둘 다 빠르게 확인
export const MOCK_WRITABLE_REVIEWS: WritableReviewItem[] = Array.from(
  { length: 5 },
  (_, index) => {
    const base = BASE_ITEMS[index % BASE_ITEMS.length]!;
    return {
      ...base,
      id: `writable-review-${index + 1}`,
      moverName: `${base.moverName}${index >= BASE_ITEMS.length ? ` ${Math.floor(index / BASE_ITEMS.length) + 1}` : ""}`,
    };
  },
);
