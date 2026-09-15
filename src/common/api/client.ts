import { ENV } from "@/common/constants/env";

import { assertAuthGeneration, getAuthGeneration, invalidateAuthSession, withAuthLock } from "./auth-session";
import { ApiError } from "./error";
import type { ApiErrorDetail, ApiErrorResponse, ApiSuccessResponse } from "./types";

type QueryValue = string | number | boolean | null | undefined;
export interface ApiRequestOptions extends RequestInit {
  query?: Record<string, QueryValue>;
}

function createApiUrl(path: string, query?: Record<string, QueryValue>): URL {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${ENV.API_URL.replace(/\/+$/, "")}${normalizedPath}`);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  return url;
}

function isErrorDetail(value: unknown): value is ApiErrorDetail {
  return typeof value === "object" && value !== null && "field" in value &&
    typeof value.field === "string" && "reason" in value && typeof value.reason === "string";
}

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (typeof body !== "object" || body === null || !("success" in body) || body.success !== false || !("error" in body)) return false;
  const error = body.error;
  return typeof error === "object" && error !== null && "code" in error && typeof error.code === "string" &&
    "message" in error && typeof error.message === "string" &&
    (!("details" in error) || error.details === undefined || (Array.isArray(error.details) && error.details.every(isErrorDetail)));
}

/** 도메인 데이터 검증은 각 API mapper에 맡기고 공통 응답 envelope만 확인합니다. */
function isApiSuccessResponse<T>(body: unknown): body is ApiSuccessResponse<T> {
  return typeof body === "object" && body !== null && "success" in body && body.success === true && "data" in body;
}

async function request<T>(path: string, options: ApiRequestOptions): Promise<T>;
async function request(path: string, options: ApiRequestOptions): Promise<unknown> {
  const { query, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  const isFormData = typeof FormData !== "undefined" && requestOptions.body instanceof FormData;
  if (!isFormData && requestOptions.body && !requestHeaders.has("Content-Type")) requestHeaders.set("Content-Type", "application/json");
  const response = await fetch(createApiUrl(path, query), {
    ...requestOptions, credentials: "include", headers: requestHeaders,
  });
  if (response.status === 204) return undefined;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (isApiErrorResponse(body)) throw new ApiError(response.status, body.error.code, body.error.message, body.error.details);
    throw new ApiError(response.status, "UNKNOWN_ERROR", "요청 처리 중 문제가 발생했습니다.");
  }
  if (!isApiSuccessResponse(body)) throw new ApiError(response.status, "INVALID_RESPONSE", "올바르지 않은 서버 응답입니다.");
  return body.data;
}

let refreshRequest: Promise<unknown> | null = null;
let refreshRevision = 0;
let refreshGeneration = -1;
let isRefreshing = false;

function refreshSession(generation: number, revision: number): Promise<unknown> {
  assertAuthGeneration(generation);
  // 이미 갱신된 뒤 늦게 도착한 401도 같은 결과를 공유하여 쿠키를 다시 회전시키지 않습니다.
  if (refreshRequest && refreshGeneration === generation && (isRefreshing || revision < refreshRevision)) return refreshRequest;
  refreshGeneration = generation;
  refreshRevision += 1;
  isRefreshing = true;
  refreshRequest = withAuthLock(async () => {
    assertAuthGeneration(generation);
    try {
      const result = await request<unknown>("/auth/refresh", { method: "POST", cache: "no-store" });
      assertAuthGeneration(generation);
      return result;
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) invalidateAuthSession(error, generation);
      throw error;
    }
  }).finally(() => { if (refreshGeneration === generation) isRefreshing = false; });
  return refreshRequest;
}

/** Access 쿠키의 만료/자동 삭제만 갱신합니다. 자격 증명 오류 및 Refresh 자체는 제외합니다. */
export async function apiClient<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const generation = getAuthGeneration();
  const revision = refreshRevision;
  const normalizedPath = `/${path.replace(/^\/+/, "")}`;
  const canRefresh = !/^\/auth\/(login|signup|logout|refresh|oauth)(\/|$)/.test(normalizedPath);
  try {
    const result = await request<T>(path, options);
    if (typeof window !== "undefined") assertAuthGeneration(generation);
    return result;
  } catch (error) {
    if (typeof window === "undefined" || !(error instanceof ApiError) || error.status !== 401 || !canRefresh) throw error;
    if (error.code !== "ACCESS_TOKEN_EXPIRED" && error.code !== "ACCESS_TOKEN_MISSING") {
      if (error.code === "ACCESS_TOKEN_INVALID" || error.code === "USER_NOT_FOUND") invalidateAuthSession(error, generation);
      throw error;
    }
    options.signal?.throwIfAborted();
    await refreshSession(generation, revision);
    options.signal?.throwIfAborted();
    assertAuthGeneration(generation);
    // 갱신은 원 요청의 signal에 묶지 않으며 각 소비자만 취소합니다. 재시도는 이 한 번으로 끝납니다.
    try {
      const result = await request<T>(path, options);
      assertAuthGeneration(generation);
      return result;
    } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) invalidateAuthSession(retryError, generation);
      throw retryError;
    }
  }
}
