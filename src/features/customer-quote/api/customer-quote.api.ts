import { apiClient } from "@/common/api/client";

import type {
  ApiActiveMoveRequestResult,
  ApiReceivedQuoteDetailResult,
  ApiReceivedQuotesResult,
} from "./customer-quote.types";

export interface ListReceivedQuotesParams {
  keyword?: string;
  serviceType?: string;
  isDesignated?: boolean;
  sort?: "CREATED_AT_DESC" | "MOVE_DATE_ASC" | "PRICE_ASC";
  cursor?: string;
  limit?: number;
}

export interface ListReceivedQuoteHistoryParams {
  keyword?: string;
  serviceType?: string;
  moveRequestStatus?: "CONFIRMED" | "COMPLETED";
  sort?: "UPDATED_AT_DESC" | "MOVE_DATE_DESC";
  cursor?: string;
  limit?: number;
}

/** GET /customers/me/quotes — 활성 요청의 대기(PROPOSED) 견적 목록 */
export function getReceivedQuotes(params: ListReceivedQuotesParams = {}) {
  return apiClient<ApiReceivedQuotesResult>("/customers/me/quotes", {
    method: "GET",
    query: {
      keyword: params.keyword,
      serviceType: params.serviceType,
      isDesignated: params.isDesignated,
      sort: params.sort,
      cursor: params.cursor,
      limit: params.limit ?? 20,
    },
  });
}

/** GET /customers/me/quotes/history — 확정 견적 이력 목록 */
export function getReceivedQuoteHistory(
  params: ListReceivedQuoteHistoryParams = {},
) {
  return apiClient<ApiReceivedQuotesResult>("/customers/me/quotes/history", {
    method: "GET",
    query: {
      keyword: params.keyword,
      serviceType: params.serviceType,
      moveRequestStatus: params.moveRequestStatus,
      sort: params.sort,
      cursor: params.cursor,
      limit: params.limit ?? 50,
    },
  });
}

/** GET /customers/me/quotes/:quoteId — 대기 견적 상세 */
export function getReceivedQuoteDetail(quoteId: string) {
  return apiClient<ApiReceivedQuoteDetailResult>(
    `/customers/me/quotes/${quoteId}`,
    { method: "GET" },
  );
}

/** GET /customers/me/quotes/history/:quoteId — 확정 견적 상세 */
export function getReceivedQuoteHistoryDetail(quoteId: string) {
  return apiClient<ApiReceivedQuoteDetailResult>(
    `/customers/me/quotes/history/${quoteId}`,
    { method: "GET" },
  );
}

/** GET /customers/me/move-requests/active — SubHeader용 활성 이사 요청 */
export function getActiveMoveRequest() {
  return apiClient<ApiActiveMoveRequestResult>(
    "/customers/me/move-requests/active",
    { method: "GET" },
  );
}
