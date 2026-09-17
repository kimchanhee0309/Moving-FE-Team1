import type { QuoteStatus, ServiceType } from "@/common/constants/domain";

/** BE QuoteStatus. PROPOSED는 FE QUOTE_STATUS.PENDING으로 매핑합니다. */
export type ApiQuoteStatus = "PROPOSED" | "CONFIRMED" | "REJECTED";

export type ApiServiceType = "SMALL" | "HOME" | "OFFICE";

export type ApiMoveRequestStatus = "WAITING" | "CONFIRMED" | "COMPLETED";

export interface ApiQuoteListMover {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  careerYears: number;
  shortIntroduction: string;
  reviewCount: number;
  averageRating: number | null;
  favoriteCount: number;
  isFavorite: boolean;
}

export interface ApiQuoteListMoveRequest {
  id: string;
  serviceType: string;
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  status: ApiMoveRequestStatus;
}

export interface ApiQuoteListItem {
  id: string;
  price: number | null;
  comment: string | null;
  status: ApiQuoteStatus;
  isDesignated: boolean;
  createdAt: string;
  mover: ApiQuoteListMover;
  moveRequest: ApiQuoteListMoveRequest;
}

export interface ApiCursorPagination {
  nextCursor: string | null;
  hasNext: boolean;
}

export interface ApiReceivedQuotesResult {
  items: ApiQuoteListItem[];
  pagination: ApiCursorPagination;
}

export interface ApiQuoteDetailMover extends ApiQuoteListMover {
  description: string;
  serviceTypes: string[];
  regions: string[];
}

export interface ApiQuoteDetail extends Omit<ApiQuoteListItem, "mover"> {
  updatedAt: string;
  mover: ApiQuoteDetailMover;
}

export interface ApiReceivedQuoteDetailResult {
  quote: ApiQuoteDetail;
}

export interface ApiActiveMoveRequest {
  id: string;
  serviceType: ApiServiceType | string;
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  status: ApiMoveRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApiActiveMoveRequestResult {
  moveRequest: ApiActiveMoveRequest | null;
}

export interface CustomerQuoteListItemView {
  id: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  status: QuoteStatus;
  message: string;
  moverName: string;
  moverProfileImageUrl: string | null;
  rating: number;
  reviewCount: number;
  careerYears: number;
  /** BE 목록에 확정 건수 필드가 없어 0으로 둡니다. */
  confirmedCount: number;
  favoriteCount: number;
  price: number;
}

export interface CustomerQuoteMoveRequestView {
  id: string;
  serviceType: ServiceType;
  requestedAt: string;
  from: string;
  to: string;
  moveDate: string;
}

export interface CustomerQuoteHistoryGroupView {
  id: string;
  requestedAt: string;
  serviceType: ServiceType;
  from: string;
  to: string;
  moveDate: string;
  quotes: CustomerQuoteListItemView[];
}
