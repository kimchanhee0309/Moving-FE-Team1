import { ApiError } from "@/common/api/error";

import type { AddressResult } from "@/common/components/AddressCard";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/common/api/types";

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

/**
 * 견적 요청 주소 검색 프록시(`/api/address/search`, `src/app/api/address/search/route.ts`)를
 * 호출합니다. 이 endpoint는 외부 백엔드(`NEXT_PUBLIC_API_URL`)가 아니라 우리 Next.js 서버
 * 자체 Route Handler(행정안전부 도로명주소 API를 감쌈)이므로 `common/api/client.ts`의
 * `apiClient`를 억지로 쓰지 않고 상대 경로 fetch를 직접 사용합니다. 다만 에러 처리는
 * `apiClient`와 동일한 관례(성공/실패 응답 판별 후 `ApiError`로 던짐)를 그대로 따라
 * 호출부(`useAddressSearch`)가 일관되게 처리할 수 있게 합니다.
 *
 * 빈 문자열 검색은 호출부(`useAddressSearch`)에서 걸러지는 것을 전제로 하며, 이 함수 자체는
 * 검색어 검증을 책임지지 않습니다.
 */
export async function searchAddress(query: string): Promise<AddressResult[]> {
  const response = await fetch(`/api/address/search?query=${encodeURIComponent(query)}`, {
    credentials: "include",
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiErrorResponse(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message);
    }

    throw new ApiError(
      response.status,
      "UNKNOWN_ERROR",
      "주소 검색 중 문제가 발생했습니다.",
    );
  }

  if (!isApiSuccessResponse<AddressResult[]>(body)) {
    throw new ApiError(
      response.status,
      "INVALID_RESPONSE",
      "올바르지 않은 서버 응답입니다.",
    );
  }

  return body.data;
}
