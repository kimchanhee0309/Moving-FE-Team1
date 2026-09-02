import { ENV } from "@/common/constants/env";
import { ApiError } from "./error";

interface ApiRequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { query, headers, ...requestOptions } = options;

  const url = new URL(`${ENV.API_URL}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

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

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.error?.code ?? "UNKNOWN_ERROR",
      body?.error?.message ?? "요청에 실패했습니다.",
    );
  }

  return body.data;
}
