/**
 * 기사님 내 견적 관리 기능의 API DTO와 화면 ViewModel 타입을 정의함
 *
 * API 타입:
 * - 백엔드 응답 구조를 그대로 표현
 *
 * 화면 타입:
 * - 날짜 포맷 등 화면에 표시하기 좋게 변환된 데이터
 *
 * 이 파일은 API 요청, 화면 렌더링, TanStack Query 상태를 담당하지 않음
 */

import type {
  MoveRequestStatus,
  QuoteStatus,
  ServiceType,
} from "@/common/constants/domain";

/**
 * cursor 기반 목록 API의 공통 페이지 정보
 *
 * nextCursor가 null이면 다음 요청에 사용할 cursor가 없다는 의미
 */
export interface CursorPagination {
  nextCursor: string | null;
  hasNext: boolean;
}

/**
 * GET /movers/me/quotes에서 반환되는 견적 한 건의 원본 DTO
 *
 * price와 comment는 반려된 견적 또는 이전 데이터 호환을 위해
 * null이 될 수 있음
 */
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

/** GET /movers/me/quotes의 data 구조 */
export interface MoverQuoteApiPage {
  items: MoverQuoteApiItem[];
  pagination: CursorPagination;
}

/**
 * GET /movers/me/quotes/:quoteId의 견적 상세 원본 DTO
 *
 * 목록보다 requestId, 요청 날짜, 기사님 코멘트를 추가로 포함
 */
export interface MoverQuoteApiDetail extends MoverQuoteApiItem {
  requestId: string;
  requestedAt: string;
  comment: string | null;
}

/**
 * GET /movers/me/rejected-reqeusts의 반려 기록 원본 DTO
 *
 * 반려 요청은 REJECTED Quote가 아니라 RequestRejection 데이터를
 * 기반으로 하므로 rejectionId와 reason을 사용
 */
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

/** 반려 요청 목록 API의 data 구조 */
export interface RejectedRequestApiPage {
  items: RejectedRequestApiItem[];
  pagination: CursorPagination;
}

/**
 * 보낸 견적 카드에서 사용하는 화면 전용 데이터
 *
 * API의 quoteId는 컴포넌트에서 공통적으로 사용할 수 있도록 id로 바꾸고,
 * moveDate는 한국어 표시 형식으로 변환된 값을 받음
 */
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

/** ViewModel로 변환된 보낸 견적 한 페이지 */
export interface MoverQuotePage {
  items: MoverQuoteCardData[];
  pagination: CursorPagination;
}

/** 견적 상세 화면에서 사용하는 화면 전용 데이터 */
export interface MoverQuoteDetailData extends MoverQuoteCardData {
  requestId: string;
  requestedAt: string;
  comment: string | null;
}

/**
 * 기사님이 직접 반려한 요청 카드의 화면 전용 데이터
 *
 * id는 React key로 사용할 rejectionId이며,
 * requestId는 원본 이사 요청 식별자임
 */
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

/** ViewModel로 변환된 반려 요청 한 페이지 */
export interface RejectedRequestPage {
  items: RejectedRequestCardData[];
  pagination: CursorPagination;
}
