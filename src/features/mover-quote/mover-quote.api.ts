/**
 * 기사님 내 견적 관리의 HTTP 요청과 응답 변환을 담당
 *
 * 담당 기능:
 * - 보낸 견적 목록 조회
 * - 견적 상세 조회
 * - 반려한 요청 목록 조회
 * - unknown 응답의 런타임 검증
 * - API DTO를 화면 ViewModel로 변환
 *
 * 담당하지 않는 기능:
 * - TanStack Query 캐시
 * - loading/error UI
 * - 페이지 라우팅
 */

import { apiClient } from "@/common/api/client";
import { ApiError } from "@/common/api/error";
import {
  MOVE_REQUEST_STATUS,
  QUOTE_STATUS,
  SERVICE_TYPE,
  type MoveRequestStatus,
  type QuoteStatus,
  type ServiceType,
} from "@/common/constants/domain";

import type {
  CursorPagination,
  MoverQuoteApiDetail,
  MoverQuoteApiItem,
  MoverQuoteCardData,
  MoverQuoteDetailData,
  MoverQuotePage,
  RejectedRequestApiItem,
  RejectedRequestCardData,
  RejectedRequestPage,
} from "./mover-quote.types";

/**
 * TypeScript 타입은 런타임 서버 응답을 검증하지 못하므로,
 * 서버에서 전달된 문자열이 실제 enum 값인지 확인하기 위한 Set
 */
const SERVICE_TYPES = new Set<string>(Object.values(SERVICE_TYPE));
const QUOTE_STATUSES = new Set<string>(Object.values(QUOTE_STATUS));
const MOVE_REQUEST_STATUSES = new Set<string>(
  Object.values(MOVE_REQUEST_STATUS),
);

/**
 * HTTP 요청은 성공했지만 응답 구조가 API 계약과 다를 때 발생시킴
 *
 * 인증 오류나 서버 오류가 아니라 프론트와 백엔드 응답 계약이
 * 어긋난 상황을 구분하기 위해 INVALID_RESPONSE를 사용
 */
function invalidResponse(message: string): never {
  throw new ApiError(200, "INVALID_RESPONSE", message);
}

/** unknown 값이 배열이나 null이 아닌 JSON 객체인지 검사 */
function readObject(value: unknown, message: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return invalidResponse(message);
  }
  return value as Record<string, unknown>;
}

/** unknown 값이 문자열인지 검사 */
function readString(value: unknown, message: string): string {
  if (typeof value !== "string") {
    return invalidResponse(message);
  }

  return value;
}

/** unknown 값이 boolean인지 검사 */
function readBoolean(value: unknown, message: string): boolean {
  if (typeof value !== "boolean") {
    return invalidResponse(message);
  }

  return value;
}

/** nullable 문자열을 검증 */
function readNullableString(value: unknown, message: string): string | null {
  if (value === null) {
    return null;
  }

  return readString(value, message);
}

/**
 * nullable 숫자를 검증
 *
 * 반려 견적 등에서는 가격이 null일 수 있으므로 null을 정상값으로 유지
 */
function readNullableNumber(value: unknown, message: string): number | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return invalidResponse(message);
  }

  return value;
}

/** 문자열이면서 실제로 파싱 가능한 날짜인지 검사 */
function readDateString(value: unknown, message: string): string {
  const dateString = readString(value, message);

  if (Number.isNaN(new Date(dateString).getTime())) {
    return invalidResponse(message);
  }

  return dateString;
}

/** 서버 서비스 유형이 프로젝트 enum에 포함되는지 검사 */
function readServiceType(value: unknown): ServiceType {
  if (typeof value !== "string" || !SERVICE_TYPES.has(value)) {
    return invalidResponse("서비스 유형이 올바르지 않습니다.");
  }

  return value as ServiceType;
}

/** 서버 견적 상태가 프로젝트 enum에 포함되는지 검사 */
function readQuoteStatus(value: unknown): QuoteStatus {
  if (typeof value !== "string" || !QUOTE_STATUSES.has(value)) {
    return invalidResponse("견적 상태가 올바르지 않습니다.");
  }

  return value as QuoteStatus;
}

/** 서버 이사 요청 상태가 프로젝트 enum에 포함되는지 검사 */
function readMoveRequestStatus(value: unknown): MoveRequestStatus {
  if (typeof value !== "string" || !MOVE_REQUEST_STATUSES.has(value)) {
    return invalidResponse("이사 요청 상태가 올바르지 않습니다.");
  }

  return value as MoveRequestStatus;
}

/**
 * cursor pagination 응답 검증
 *
 * hasNext가 false라면 다음 요청을 만들지 않으며,
 * nextCursor는 null이 될 수 있음
 */
function readPagination(value: unknown): CursorPagination {
  const pagination = readObject(value, "페이지 정보가 올바르지 않습니다.");

  if (
    pagination.nextCursor !== null &&
    typeof pagination.nextCursor !== "string"
  ) {
    return invalidResponse("다음 페이지 정보가 올바르지 않습니다.");
  }

  return {
    nextCursor: pagination.nextCursor,
    hasNext: readBoolean(
      pagination.hasNext,
      "다음 페이지 여부가 올바르지 않습니다.",
    ),
  };
}

/** 보낸 견적 목록의 한 항목을 런타임 검증함 */
function readMoverQuoteItem(value: unknown): MoverQuoteApiItem {
  const item = readObject(value, "보낸 견적 항목이 올바르지 않습니다.");

  return {
    quoteId: readString(item.quoteId, "견적 ID가 올바르지 않습니다."),
    customerName: readString(
      item.customerName,
      "고객 이름이 올바르지 않습니다.",
    ),
    serviceType: readServiceType(item.serviceType),
    isDesignated: readBoolean(
      item.isDesignated,
      "지정 견적 여부가 올바르지 않습니다.",
    ),
    fromAddress: readString(
      item.fromAddress,
      "출발지 정보가 올바르지 않습니다.",
    ),
    toAddress: readString(item.toAddress, "도착지 정보가 올바르지 않습니다."),
    moveDate: readDateString(item.moveDate, "이사일 정보가 올바르지 않습니다."),
    price: readNullableNumber(item.price, "견적 금액이 올바르지 않습니다."),
    quoteStatus: readQuoteStatus(item.quoteStatus),
    moveRequestStatus: readMoveRequestStatus(item.moveRequestStatus),
  };
}

/** 기사님이 직접 반려한 요청 한 항목을 런타임 검증 */
function readRejectedRequestItem(value: unknown): RejectedRequestApiItem {
  const item = readObject(value, "반려 요청 항목이 올바르지 않습니다.");

  return {
    rejectionId: readString(item.rejectionId, "반려 ID가 올바르지 않습니다."),
    requestId: readString(item.requestId, "요청 ID가 올바르지 않습니다."),
    customerName: readString(
      item.customerName,
      "고객 이름이 올바르지 않습니다.",
    ),
    serviceType: readServiceType(item.serviceType),
    isDesignated: readBoolean(
      item.isDesignated,
      "지정 요청 여부가 올바르지 않습니다.",
    ),
    fromAddress: readString(
      item.fromAddress,
      "출발지 정보가 올바르지 않습니다.",
    ),
    toAddress: readString(item.toAddress, "도착지 정보가 올바르지 않습니다."),
    moveDate: readDateString(item.moveDate, "이사일 정보가 올바르지 않습니다."),
    reason: readString(item.reason, "반려 사유가 올바르지 않습니다."),
    rejectedAt: readDateString(
      item.rejectedAt,
      "반려 날짜가 올바르지 않습니다.",
    ),
  };
}

/**
 * ISO 날짜를 카드용 한국어 날짜로 변환
 *
 * 브라우저의 timezone과 무관하게 서비스 기준인 Asia/Seoul로 표시
 */
function formatDate(dateString: string): string {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(new Date(dateString));

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";

  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

/** 견적 요청일을 상세 화면의 짧은 날짜 형식으로 변환 */
function formatShortDate(dateString: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date(dateString))
    .replaceAll(" ", "")
    .replace(/\.$/, "");
}

/**
 * 보낸 견적 API DTO를 카드용 ViewModel로 변환
 *
 * 서버 필드명은 API 경계에서만 사용하고 화면에는 id와 표시용 날짜를 전달
 */
function toMoverQuoteCardData(item: MoverQuoteApiItem): MoverQuoteCardData {
  return {
    id: item.quoteId,
    customerName: item.customerName,
    serviceType: item.serviceType,
    isDesignated: item.isDesignated,
    fromAddress: item.fromAddress,
    toAddress: item.toAddress,
    moveDate: formatDate(item.moveDate),
    price: item.price,
    quoteStatus: item.quoteStatus,
    moveRequestStatus: item.moveRequestStatus,
  };
}

/** 반려 요청 API DTO를 카드용 ViewModel로 변환 */
function toRejectedRequestCardData(
  item: RejectedRequestApiItem,
): RejectedRequestCardData {
  return {
    id: item.rejectionId,
    requestId: item.requestId,
    customerName: item.customerName,
    serviceType: item.serviceType,
    isDesignated: item.isDesignated,
    fromAddress: item.fromAddress,
    toAddress: item.toAddress,
    moveDate: formatDate(item.moveDate),
    reason: item.reason,
    rejectedAt: item.rejectedAt,
  };
}

/** 보낸 견적 목록 응답 전체를 검증하고 ViewModel로 변환 */
function readMoverQuotePage(value: unknown): MoverQuotePage {
  const data = readObject(value, "보낸 견적 목록 응답이 올바르지 않습니다.");

  if (!Array.isArray(data.items)) {
    return invalidResponse("보낸 견적 목록이 올바르지 않습니다.");
  }

  return {
    items: data.items.map(readMoverQuoteItem).map(toMoverQuoteCardData),
    pagination: readPagination(data.pagination),
  };
}

/**
 * 견적 상세 응답을 검증하고 상세 화면 ViewModel로 변환
 *
 * 공통 apiClient가 success/data envelope까지 제거하므로 여기서 받는
 * value는 `{ quote: {...} }` 구조임
 */
function readMoverQuoteDetail(value: unknown): MoverQuoteDetailData {
  const data = readObject(value, "견적 상세 응답이 올바르지 않습니다.");

  const quoteObject = readObject(
    data.quote,
    "견적 상세 정보가 올바르지 않습니다.",
  );

  const item = readMoverQuoteItem(quoteObject);

  const detail: MoverQuoteApiDetail = {
    ...item,
    requestId: readString(
      quoteObject.requestId,
      "견적 요청 ID가 올바르지 않습니다.",
    ),
    requestedAt: readDateString(
      quoteObject.requestedAt,
      "견적 요청 날짜가 올바르지 않습니다.",
    ),
    comment: readNullableString(
      quoteObject.comment,
      "견적 코멘트가 올바르지 않습니다.",
    ),
  };

  return {
    ...toMoverQuoteCardData(detail),
    requestId: detail.requestId,
    requestedAt: formatShortDate(detail.requestedAt),
    comment: detail.comment,
  };
}

/** 반려 요청 목록 응답 전체를 검증하고 ViewModel로 변환 */
function readRejectedRequestPage(value: unknown): RejectedRequestPage {
  const data = readObject(value, "반려 요청 목록 응답이 올바르지 않습니다.");

  if (!Array.isArray(data.items)) {
    return invalidResponse("반려 요청 목록이 올바르지 않습니다.");
  }

  return {
    items: data.items
      .map(readRejectedRequestItem)
      .map(toRejectedRequestCardData),
    pagination: readPagination(data.pagination),
  };
}

/**
 * 기사님이 보낸 견적을 cursor pagination으로 조회
 *
 * @param input status 필터와 cursor pagination 조건
 * @param signal TanStack Query 취소 시 fetch도 함께 취소하는 signal
 */
export async function fetchMoverQuotes(
  input: {
    status?: QuoteStatus;
    cursor?: string;
    limit: number;
  },
  signal?: AbortSignal,
): Promise<MoverQuotePage> {
  const data = await apiClient<unknown>("/movers/me/quotes", {
    method: "GET",
    signal,
    query: {
      status: input.status,
      cursor: input.cursor,
      limit: input.limit,
    },
  });

  return readMoverQuotePage(data);
}

/**
 * 기사님이 보낸 견적 한 건의 상세 정보를 조회
 *
 * @param quoteId 조회할 견적 UUID
 * @param signal TanStack Query 취소 시 fetch도 함께 취소하는 signal
 */
export async function fetchMoverQuoteDetail(
  quoteId: string,
  signal?: AbortSignal,
): Promise<MoverQuoteDetailData> {
  const data = await apiClient<unknown>(`/movers/me/quotes/${quoteId}`, {
    method: "GET",
    signal,
  });

  return readMoverQuoteDetail(data);
}

/**
 * 기사님이 직접 반려한 요청 목록 조회
 *
 * 이 API는 QuoteStatus.REJECTED 목록이 아니라 RequestRejection 기반
 * 목록을 조회
 *
 * @param input cursor pagination 조건
 * @param signal TanStack Query 취소 시 fetch도 함께 취소하는 signal
 */
export async function fetchRejectedRequests(
  input: {
    cursor?: string;
    limit: number;
  },
  signal?: AbortSignal,
): Promise<RejectedRequestPage> {
  const data = await apiClient<unknown>("/movers/me/rejected-requests", {
    method: "GET",
    signal,
    query: {
      cursor: input.cursor,
      limit: input.limit,
    },
  });

  return readRejectedRequestPage(data);
}
