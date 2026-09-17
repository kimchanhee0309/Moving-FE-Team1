import { ServiceType } from "@/common/constants/domain";

export type ReceivedRequestSort = "REQUESTED_AT_DESC" | "MOVE_DATE_ASC";

export interface CursorPagination {
  nextCursor: string | null;
  hasNext: boolean;
}

export interface ReceivedRequestsQuery {
  keyword?: string;
  serviceType?: ServiceType;
  isDesignated?: boolean;
  sort: ReceivedRequestSort;
  limit: number;
}

export interface ReceivedRequestApiItem {
  requestId: string;
  customerName: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  requestedAt: string;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
}

export interface ReceivedRequestApiPage {
  items: ReceivedRequestApiItem[];
  pagination: CursorPagination;
}

export interface ReceivedRequestViewModel {
  requestId: string;
  customerName: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  requestedAt: string;
  requestedAtLabel: string;
  departureLabel: string;
  arrivalLabel: string;
  moveDate: string;
  moveDateLabel: string;
}

export interface ReceivedRequestPage {
  items: ReceivedRequestViewModel[];
  paginateion: CursorPagination;
}

export interface SendQuoteFormValue {
  price: number;
  comment: string;
}

export interface RejectRequestFormValue {
  reason: string;
}

export interface CreatedQuote {
  quoteId: string;
  requestId: string;
  price: number;
  comment: string;
  status: "PROPOSED";
  createdAt: string;
}

export interface CreatedRequestRejection {
  rejectionId: string;
  requestId: string;
  reason: string;
  rejectedAt: string;
}
