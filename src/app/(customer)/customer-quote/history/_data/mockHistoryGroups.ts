import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

import {
  DEFAULT_MOVER_PROFILE_IMAGE,
  SERVICE_TYPE_LABEL,
  type CustomerQuoteDetail,
} from "../../_lib/customerQuoteDetail";

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

export interface FoundHistoryQuote {
  quote: HistoryQuoteItem;
  group: HistoryRequestGroup;
}

/** 목록 mock에서 견적과 소속 요청을 함께 찾습니다. 없으면 undefined입니다. */
export function findHistoryQuoteById(
  quoteId: string,
): FoundHistoryQuote | undefined {
  for (const group of MOCK_HISTORY_GROUPS) {
    const quote = group.quotes.find((item) => item.id === quoteId);
    if (quote) {
      return { group, quote };
    }
  }

  return undefined;
}

/**
 * 이력 목록 카드와 같은 견적·이사 정보를 상세 화면 모델로 맞춥니다.
 * 칩 서비스 유형은 quote.serviceType, 견적 정보 문구는 같은 값의 라벨입니다.
 */
export function toCustomerQuoteDetail(
  found: FoundHistoryQuote,
): CustomerQuoteDetail {
  const { quote, group } = found;

  return {
    id: quote.id,
    serviceType: quote.serviceType,
    isDesignated: quote.isDesignated,
    status: quote.status,
    message: quote.message,
    moverName: quote.moverName,
    profileImageUrl: DEFAULT_MOVER_PROFILE_IMAGE,
    rating: quote.rating,
    reviewCount: quote.reviewCount,
    careerYears: quote.careerYears,
    confirmedCount: quote.confirmedCount,
    favoriteCount: quote.favoriteCount,
    price: quote.price,
    requestedAt: group.requestedAt,
    serviceLabel: SERVICE_TYPE_LABEL[quote.serviceType],
    moveDateLabel: group.moveDate,
    from: group.from,
    to: group.to,
  };
}
