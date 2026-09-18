import "server-only";

import { dehydrate, QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";

import { ApiError } from "@/common/api/error";
import { getServerAuthRequestOptions } from "@/common/auth/server";

import {
  getReceivedQuoteDetail,
  getReceivedQuoteHistoryDetail,
} from "./customer-quote.api";
import { customerQuoteQueryKeys } from "./customer-quote.keys";
import { mapQuoteDetail } from "./customer-quote.mapper";

function isQuoteNotFound(error: unknown) {
  return (
    error instanceof ApiError &&
    (error.status === 404 || error.code === "QUOTE_NOT_FOUND")
  );
}

/**
 * 대기 견적 상세를 서버에서 조회합니다.
 * 누락(QUOTE_NOT_FOUND/404)이면 notFound()로 HTTP 404를 반환하고,
 * 성공 데이터는 클라이언트와 동일한 query key로 dehydrate합니다.
 */
export async function prefetchReceivedQuoteDetail(quoteId: string) {
  const queryClient = new QueryClient();
  const authOptions = await getServerAuthRequestOptions();

  try {
    const result = await getReceivedQuoteDetail(quoteId, authOptions);
    queryClient.setQueryData(
      customerQuoteQueryKeys.pendingDetail(quoteId),
      mapQuoteDetail(result.quote),
    );
  } catch (error) {
    if (isQuoteNotFound(error)) {
      notFound();
    }
  }

  return dehydrate(queryClient);
}

/**
 * 이력 견적 상세를 서버에서 조회합니다.
 * 누락이면 notFound()를 호출해 history/[quoteId]/not-found.tsx가 응답합니다.
 */
export async function prefetchReceivedQuoteHistoryDetail(quoteId: string) {
  const queryClient = new QueryClient();
  const authOptions = await getServerAuthRequestOptions();

  try {
    const result = await getReceivedQuoteHistoryDetail(quoteId, authOptions);
    queryClient.setQueryData(
      customerQuoteQueryKeys.historyDetail(quoteId),
      mapQuoteDetail(result.quote),
    );
  } catch (error) {
    if (isQuoteNotFound(error)) {
      notFound();
    }
  }

  return dehydrate(queryClient);
}
