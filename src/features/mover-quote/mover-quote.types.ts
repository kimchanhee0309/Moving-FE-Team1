import type {
  MoveRequestStatus,
  QuoteStatus,
  ServiceType,
} from "@/common/constants/domain";

export interface CursorPagination {
  nextCursor: string | null;
  hasNext: boolean;
}

export interface MoverQuoteApiItem {
  quoteId: string;
  customerName: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  price: number | null;
  quoteStatus: QuoteStatus;
  moveRequestStatus: MoveRequestStatus;
}

export interface MoverQuoteApiPage {
  items: MoverQuoteApiItem[];
  pagination: CursorPagination;
}

export interface MoverQuoteApiDetail extends MoverQuoteApiItem {
  requestId: string;
  requestedAt: string;
  comment: string | null;
}

export interface RejectedRequestApiItem {
  rejectionId: string;
  requestId: string;
  customerName: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  reason: string;
  rejectedAt: string;
}

export interface RejectedRequestApiPage {
  items: RejectedRequestApiItem[];
  pagination: CursorPagination;
}

export interface MoverQuoteCardData {
  id: string;
  customerName: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  price: number | null;
  quoteStatus: QuoteStatus;
  moveRequestStatus: MoveRequestStatus;
}

export interface MoverQuotePage {
  items: MoverQuoteCardData[];
  pagination: CursorPagination;
}

export interface MoverQuoteDetailData extends MoverQuoteCardData {
  requestId: string;
  requestedAt: string;
  comment: string | null;
}

export interface RejectedRequestCardData {
  id: string;
  requestId: string;
  customerName: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  reason: string;
  rejectedAt: string;
}

export interface RejectedRequestPage {
  items: RejectedRequestCardData[];
  pagination: CursorPagination;
}
