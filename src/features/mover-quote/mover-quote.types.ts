import type {
  MoveRequestStatus,
  QuoteStatus,
  ServiceType,
} from "@/common/constants/domain";

export interface MoverQuoteCardData {
  id: string;
  customerName: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
  price: number;
  quoteStatus: QuoteStatus;
  moveRequestStatus: MoveRequestStatus;
}

export interface RejectedRequestCardData {
  id: string;
  customerName: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  fromAddress: string;
  toAddress: string;
  moveDate: string;
}

export interface MoverQuoteDetailData extends MoverQuoteCardData {
  requestedAt: string;
}
