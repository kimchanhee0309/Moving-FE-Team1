import { apiClient } from "@/common/api/client";
import { ApiError } from "@/common/api/error";
import { getAuthSessionState } from "./session";
import { readUser } from "./user.mapper";

/** 백엔드와 합의된 Access 쿠키 이름입니다. Refresh 쿠키는 일반 페이지 요청에 포함되지 않습니다. */
export const ACCESS_TOKEN_COOKIE = "accessToken";

/**
 * 서버 요청에서 읽은 Access만 /auth/me에 전달하고 공개 DTO로 검증합니다.
 * Cookie 헤더 전체·Refresh는 전달하지 않으며 토큰 해석, 쿠키 변경, 사용자 전역 저장은 하지 않습니다.
 * 401은 인증 실패, 통신 장애는 network-error로 반환하고 서버 간 사용자 캐시 공유를 막습니다.
 */
export async function fetchRequestSession(accessToken: string | undefined): Promise<ReturnType<typeof getAuthSessionState>> {
  if (!accessToken) return getAuthSessionState({ user: null, failure: null }, null, false);
  try {
    const data = await apiClient<unknown>("/auth/me", {
      headers: { Cookie: `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}` },
      cache: "no-store",
    });
    return getAuthSessionState({ user: readUser(data), failure: null }, null, false);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    if (error instanceof ApiError && error.status === 401) {
      return getAuthSessionState({ user: null, failure: error }, null, false);
    }
    return getAuthSessionState(undefined, error, false);
  }
}
