import { ENV } from "@/common/constants/env";

import { ApiError } from "./error";

import type { ApiErrorResponse, ApiSuccessResponse } from "./types";

type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions extends RequestInit {
  query?: Record<string, QueryValue>;
}

function createApiUrl(path: string, query?: Record<string, QueryValue>) {
  const apiUrl = ENV.API_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const url = new URL(`${apiUrl}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const response = body as Partial<ApiErrorResponse>;

  return (
    response.success === false &&
    typeof response.error?.code === "string" &&
    typeof response.error.message === "string"
  );
}

function isApiSuccessResponse<T>(body: unknown): body is ApiSuccessResponse<T> {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  return (body as Partial<ApiSuccessResponse<T>>).success === true;
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { query, headers, ...requestOptions } = options;

  const url = createApiUrl(path, query);

  const isFormData =
    typeof FormData !== "undefined" && requestOptions.body instanceof FormData;

  const response = await fetch(url, {
    ...requestOptions,
    credentials: "include",
    headers: {
      ...(!isFormData && requestOptions.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message);
    }

    throw new ApiError(
      response.status,
      "UNKNOWN_ERROR",
      "요청 처리 중 문제가 발생했습니다.",
    );
  }

  if (!isApiSuccessResponse<T>(body)) {
    throw new ApiError(
      response.status,
      "INVALID_RESPONSE",
      "올바르지 않은 서버 응답입니다.",
    );
  }

  return body.data;
}
