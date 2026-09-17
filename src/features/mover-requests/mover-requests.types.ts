import { ServiceType } from "@/common/constants/domain";

/**
 * 받은 요청 목록에서 BE가 지원하는 정렬 방식
 *
 * REQUESTED_AT_DESC: 최근 요청순
 * MOVE_DATE_ASC: 이사 예정일이 삐란 순
 */
export type ReceivedRequestSort = "REQUESTED_AT_DESC" | "MOVE_DATE_ASC";

/** Cursor 기반 목록 API의 페이지 정보 */
export interface CursorPagination {
  /** 다음 페이지가 없으면 null */
  nextCursor: string | null;

  /** 다음 페이지가 존재하는지 나타냄 */
  hasNext: boolean;
}

/**
 * GET /movers/me/received-requests의 Query Parameter입
 *
 * cursor는 각 페이지를 불러올 때 API 함수가 별도로 추가하므로
 * 화면의 기본 조회 조건에는 포함하지 않음
 */
export interface ReceivedRequestsQuery {
  keyword?: string;
  serviceType?: ServiceType;
  isDesignated?: boolean;
  sort: ReceivedRequestSort;
  limit: number;
}

/** 백엔드가 반환하는 받은 요청 한 건의 웝본 DTO */
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

/** 백엔드가 반환하는 받은 요청 목록의 data */
export interface ReceivedRequestApiPage {
  items: ReceivedRequestApiItem[];
  pagination: CursorPagination;
}

/**
 * 받은 요청 카드와 모달에서 사용하는 화면 전용 데이터
 *
 * 백엔드 원본 날짜와 주소를 그대로 수정하지 않고,
 * 사용자게에 표시할 label을 별도로 관리
 */
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

/** ViewModel로 변환된 받은 요청 한 페이지 */
export interface ReceivedRequestPage {
  items: ReceivedRequestViewModel[];
  paginateion: CursorPagination;
}

/** 견적 보내기 모달의 입력값 */
export interface SendQuoteFormValue {
  price: number;
  comment: string;
}

/** 반려 요청 모달의 입력값 */
export interface RejectRequestFormValue {
  reason: string;
}

/** POST 견적 보내기 성공 시 반환되는 견적 */
export interface CreatedQuote {
  quoteId: string;
  requestId: string;
  price: number;
  comment: string;
  status: "PROPOSED";
  createdAt: string;
}

/** POST 요청 반려 성공 시 반환되는 반려 기록 */
export interface CreatedRequestRejection {
  rejectionId: string;
  requestId: string;
  reason: string;
  rejectedAt: string;
}
