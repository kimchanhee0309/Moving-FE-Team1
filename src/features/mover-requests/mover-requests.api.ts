/**
 * 기사님의 받은 요청 관련 API 계층
 *
 * 담당 기능:
 * - 받은 요청 목록 조회
 * - 받은 요청에 견적 전송
 * - 받은 요청 반려
 * - unknown 서버 응답의 런타임 검증
 * - API DTO를 화면 ViewModel로 변환
 *
 * 담당하지 않는 기능:
 * - TanStack Query 캐시
 * - 모달 상태
 * - 화면 렌더링
 */

import { apiClient } from "@/common/api/client";
import { ApiError } from "@/common/api/error";
import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

import type {
  CreatedQuote,
  CreatedRequestRejection,
  CursorPagination,
  ReceivedRequestApiItem,
  ReceivedRequestPage,
  ReceivedRequestsQuery,
  ReceivedRequestViewModel,
  RejectRequestFormValue,
  SendQuoteFormValue,
} from "./mover-requests.types";

const SERVICE_TYPES = new Set<string>(Object.values(SERVICE_TYPE));

/**
 * 서버 응답 계약이 깨졌을 때 공통 INVALID_RESPONSE 오류를 발생시킵니다.
 *
 * HTTP 요청 자체는 성공했지만 response data의 구조가
 * Swagger와 다른 경우 사용합니다.
 */
function invalidResponse(message: string): never {
  throw new ApiError(200, "INVALID_RESPONSE", message);
}

/**
 * unknown 값을 일반 JSON object로 좁힙니다.
 *
 * 배열과 null도 typeof 결과가 object이므로 명시적으로 제외합니다.
 */
function readObject(value: unknown, message: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return invalidResponse(message);
  }

  return value as Record<string, unknown>;
}

function readString(value: unknown, message: string): string {
  if (typeof value !== "string") {
    return invalidResponse(message);
  }

  return value;
}

function readBoolean(value: unknown, message: string): boolean {
  if (typeof value !== "boolean") {
    return invalidResponse(message);
  }

  return value;
}

function readNumber(value: unknown, message: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return invalidResponse(message);
  }

  return value;
}

function readDateString(value: unknown, message: string): string {
  const dateString = readString(value, message);

  if (Number.isNaN(new Date(dateString).getTime())) {
    return invalidResponse(message);
  }

  return dateString;
}

function readServiceType(value: unknown): ServiceType {
  if (typeof value !== "string" || !SERVICE_TYPES.has(value)) {
    return invalidResponse("받은 요청의 서비스 유형이 올바르지 않습니다.");
  }

  return value as ServiceType;
}

function readPagination(value: unknown): CursorPagination {
  const pagination = readObject(
    value,
    "받은 요청 페이지 정보가 올바르지 않습니다.",
  );

  const nextCursorValue = pagination.nextCursor;

  if (nextCursorValue !== null && typeof nextCursorValue !== "string") {
    return invalidResponse("받은 요청의 다음 페이지 정보가 올바르지 않습니다.");
  }

  return {
    nextCursor: nextCursorValue,
    hasNext: readBoolean(
      pagination.hasNext,
      "받은 요청의 다음 페이지 여부가 올바르지 않습니다.",
    ),
  };
}

function readReceivedRequestItem(value: unknown): ReceivedRequestApiItem {
  const item = readObject(value, "받은 요청 항목이 올바르지 않습니다.");

  return {
    requestId: readString(item.requestId, "받은 요청 ID가 올바르지 않습니다."),
    customerName: readString(
      item.customerName,
      "고객 이름이 올바르지 않습니다.",
    ),
    serviceType: readServiceType(item.serviceType),
    isDesignated: readBoolean(
      item.isDesignated,
      "지정 견적 여부가 올바르지 않습니다.",
    ),
    moveDate: readDateString(item.moveDate, "이사 날짜가 올바르지 않습니다."),
    fromAddress: readString(
      item.fromAddress,
      "출발지 정보가 올바르지 않습니다.",
    ),
    toAddress: readString(item.toAddress, "도착지 정보가 올바르지 않습니다."),
    requestedAt: readDateString(
      item.requestedAt,
      "요청 날짜가 올바르지 않습니다.",
    ),
  };
}

/**
 * 상세 주소에서 카드에 표시할 시·도와 시·군·구까지만 추출합니다.
 *
 * 원본 주소는 변경하지 않고 화면 표시값에만 적용합니다.
 */
function formatAddressSummary(address: string): string {
  const addressWithoutPostalCode = address
    .trim()
    .replace(/^(?:\[\d{5}\]|\d{5})\s*/, "");

  const addressParts = addressWithoutPostalCode.split(/\s+/);

  return addressParts.slice(0, 2).join(" ");
}

function formatMoveDate(dateString: string): string {
  const date = new Date(dateString);

  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";

  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

function formatRequestedAt(dateString: string): string {
  const requestedAt = new Date(dateString);
  const difference = Date.now() - requestedAt.getTime();

  if (difference < 0) {
    return "방금 전";
  }

  const minutes = Math.floor(difference / 60_000);

  if (minutes < 1) {
    return "방금 전";
  }

  if (minutes < 60) {
    return `${minutes}분 전`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}시간 전`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}일 전`;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(requestedAt);
}

function toReceivedRequestViewModel(
  item: ReceivedRequestApiItem,
): ReceivedRequestViewModel {
  return {
    requestId: item.requestId,
    customerName: item.customerName,
    serviceType: item.serviceType,
    isDesignated: item.isDesignated,
    requestedAt: item.requestedAt,
    requestedAtLabel: formatRequestedAt(item.requestedAt),
    departureLabel: formatAddressSummary(item.fromAddress),
    arrivalLabel: formatAddressSummary(item.toAddress),
    moveDate: item.moveDate,
    moveDateLabel: formatMoveDate(item.moveDate),
  };
}

function readReceivedRequestPage(value: unknown): ReceivedRequestPage {
  const data = readObject(value, "받은 요청 목록 응답이 올바르지 않습니다.");

  if (!Array.isArray(data.items)) {
    return invalidResponse("받은 요청 목록 항목이 올바르지 않습니다.");
  }

  return {
    items: data.items
      .map(readReceivedRequestItem)
      .map(toReceivedRequestViewModel),
    pagination: readPagination(data.pagination),
  };
}

function readCreatedQuote(value: unknown): CreatedQuote {
  const data = readObject(value, "견적 생성 응답이 올바르지 않습니다.");

  const quote = readObject(data.quote, "생성된 견적 정보가 올바르지 않습니다.");

  const status = readString(
    quote.status,
    "생성된 견적 상태가 올바르지 않습니다.",
  );

  if (status !== "PROPOSED") {
    return invalidResponse("생성된 견적 상태가 PROPOSED가 아닙니다.");
  }

  return {
    quoteId: readString(quote.quoteId, "생성된 견적 ID가 올바르지 않습니다."),
    requestId: readString(quote.requestId, "견적 요청 ID가 올바르지 않습니다."),
    price: readNumber(quote.price, "생성된 견적 금액이 올바르지 않습니다."),
    comment: readString(
      quote.comment,
      "생성된 견적 코멘트가 올바르지 않습니다.",
    ),
    status,
    createdAt: readDateString(
      quote.createdAt,
      "견적 생성 날짜가 올바르지 않습니다.",
    ),
  };
}

function readCreatedRejection(value: unknown): CreatedRequestRejection {
  const data = readObject(value, "반려 응답이 올바르지 않습니다.");

  const rejection = readObject(
    data.rejection,
    "생성된 반려 정보가 올바르지 않습니다.",
  );

  return {
    rejectionId: readString(
      rejection.rejectionId,
      "반려 ID가 올바르지 않습니다.",
    ),
    requestId: readString(
      rejection.requestId,
      "반려 요청 ID가 올바르지 않습니다.",
    ),
    reason: readString(rejection.reason, "반려 사유가 올바르지 않습니다."),
    rejectedAt: readDateString(
      rejection.rejectedAt,
      "반려 날짜가 올바르지 않습니다.",
    ),
  };
}

/**
 * 기사님이 처리할 수 있는 받은 요청 목록을 조회합니다.
 *
 * cursor는 useInfiniteQuery가 넘겨준 다음 페이지 식별자입니다.
 * 응답은 런타임 검증을 거친 뒤 카드용 ViewModel로 변환합니다.
 *
 * @param query 검색, 서비스, 지정 여부, 정렬, pagination 조건
 * @param signal Query 취소 시 fetch도 함께 취소하기 위한 AbortSignal
 */
export async function fetchReceivedRequests(
  query: ReceivedRequestsQuery & {
    cursor?: string;
  },
  signal?: AbortSignal,
): Promise<ReceivedRequestPage> {
  const data = await apiClient<unknown>("/movers/me/received-requests", {
    method: "GET",
    signal,
    query: {
      keyword: query.keyword,
      serviceType: query.serviceType,
      isDesignated: query.isDesignated,
      sort: query.sort,
      cursor: query.cursor,
      limit: query.limit,
    },
  });

  return readReceivedRequestPage(data);
}

/**
 * 받은 요청에 새로운 PROPOSED 견적을 보냅니다.
 *
 * 성공하면 해당 요청은 받은 요청 목록에서 제외되고,
 * 보낸 견적 목록에 포함됩니다. 캐시 갱신은 mutation hook이 담당합니다.
 */
export async function sendQuote(
  requestId: string,
  value: SendQuoteFormValue,
): Promise<CreatedQuote> {
  const data = await apiClient<unknown>(
    `/movers/me/received-requests/${requestId}/quotes`,
    {
      method: "POST",
      body: JSON.stringify(value),
    },
  );

  return readCreatedQuote(data);
}

/**
 * 받은 요청을 반려합니다.
 *
 * Quote를 REJECTED로 만드는 API가 아니라
 * 별도의 RequestRejection 레코드를 생성합니다.
 */
export async function rejectReceivedRequest(
  requestId: string,
  value: RejectRequestFormValue,
): Promise<CreatedRequestRejection> {
  const data = await apiClient<unknown>(
    `/movers/me/received-requests/${requestId}/reject`,
    {
      method: "POST",
      body: JSON.stringify(value),
    },
  );

  return readCreatedRejection(data);
}
