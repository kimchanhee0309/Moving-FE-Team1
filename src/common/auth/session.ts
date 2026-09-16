import { ApiError } from "@/common/api/error";
import type { AuthSession, AuthStatus, AuthUser } from "./types";

/** 네트워크 장애는 세션 무효화의 증거가 아닙니다. 캐시 표시는 유지하되 접근 판정은 status로 제한합니다. */
export function getAuthSessionState(
  session: AuthSession | undefined,
  queryError: Error | null,
  isPending: boolean,
): { user: AuthUser | null; status: AuthStatus; error: Error | null; isAuthenticated: boolean } {
  const error = queryError ?? session?.failure ?? null;
  const isNetworkError = error instanceof TypeError;
  const user = isPending || (error && !isNetworkError) ? null : session?.user ?? null;
  const status: AuthStatus = isPending ? "loading"
    : isNetworkError ? "network-error"
    : error instanceof ApiError && error.status === 401 ? "auth-error"
    : error ? "error"
    : user ? "authenticated" : "guest";
  return { user, status, error, isAuthenticated: user !== null };
}
