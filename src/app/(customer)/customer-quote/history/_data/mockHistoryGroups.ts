import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

export interface HistoryQuoteItem {
  id: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  status: QuoteStatus;
  message: string;
  moverName: string;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
  price: number;
}

export interface HistoryRequestGroup {
  id: string;
  requestedAt: string;
  serviceType: ServiceType;
  from: string;
  to: string;
  moveDate: string;
  quotes: HistoryQuoteItem[];
}

/**
 * 받았던 견적 mock입니다. 목록과 이력 상세가 같은 id·status를 쓰도록
 * 한곳에 둡니다. history API가 붙으면 이 파일을 제거합니다.
 */
export const MOCK_HISTORY_GROUPS: HistoryRequestGroup[] = [
  createMockHistoryGroup("request-1", 1),
  createMockHistoryGroup("request-2", 5),
];

function createMockHistoryGroup(
  id: string,
  firstQuoteNumber: number,
): HistoryRequestGroup {
  const baseQuote = {
    serviceType: SERVICE_TYPE.OFFICE,
    isDesignated: true,
    message: "고객님의 물품을 안전하게 운송해 드립니다.",
    moverName: "김코드",
    rating: 5,
    reviewCount: 178,
    careerYears: 7,
    confirmedCount: 334,
    favoriteCount: 136,
    price: 180000,
  };

  return {
    id,
    requestedAt: "24. 06. 24.",
    serviceType: SERVICE_TYPE.OFFICE,
    from: "서울 중구 삼일대로 343",
    to: "서울 강남구 선릉로 428",
    moveDate: "2024년 07월 01일 (월)",
    quotes: [
      {
        ...baseQuote,
        id: String(firstQuoteNumber),
        status: QUOTE_STATUS.CONFIRMED,
      },
      {
        ...baseQuote,
        id: String(firstQuoteNumber + 1),
        status: QUOTE_STATUS.PENDING,
      },
      {
        ...baseQuote,
        id: String(firstQuoteNumber + 2),
        status: QUOTE_STATUS.PENDING,
      },
      {
        ...baseQuote,
        id: String(firstQuoteNumber + 3),
        status: QUOTE_STATUS.PENDING,
      },
    ],
  };
}

/** 이력 상세가 목록 mock의 status를 그대로 쓰게 합니다. */
export function findHistoryQuoteById(
  quoteId: string,
): HistoryQuoteItem | undefined {
  for (const group of MOCK_HISTORY_GROUPS) {
    const quote = group.quotes.find((item) => item.id === quoteId);
    if (quote) {
      return quote;
    }
  }

  return undefined;
}
