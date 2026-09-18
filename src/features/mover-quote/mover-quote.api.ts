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

const SERVICE_TYPES = new Set<string>(Object.values(SERVICE_TYPE));
const QUOTE_STATUSES = new Set<string>(Object.values(QUOTE_STATUS));
const MOVE_REQUEST_STATUSES = new Set<string>(
  Object.values(MOVE_REQUEST_STATUS),
);

function invalidResponse(message: string): never {
  throw new ApiError(200, "INVALID_RESPONSE", message);
}

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

function readNullableString(value: unknown, message: string): string | null {
  if (value === null) {
    return null;
  }

  return readString(value, message);
}

function readNullableNumber(value: unknown, message: string): number | null {
  if (value === null) {
    return null;
  }

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
    return invalidResponse("서비스 유형이 올바르지 않습니다.");
  }

  return value as ServiceType;
}

function readQuoteStatus(value: unknown): QuoteStatus {
  if (typeof value !== "string" || !QUOTE_STATUSES.has(value)) {
    return invalidResponse("견적 상태가 올바르지 않습니다.");
  }

  return value as QuoteStatus;
}

function readMoveRequestStatus(value: unknown): MoveRequestStatus {
  if (typeof value !== "string" || !MOVE_REQUEST_STATUSES.has(value)) {
    return invalidResponse("이사 요청 상태가 올바르지 않습니다.");
  }

  return value as MoveRequestStatus;
}

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
