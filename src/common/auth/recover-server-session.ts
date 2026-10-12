import { assertAuthGeneration, getAuthGeneration } from "@/common/api/auth-session";
import type { AuthContextValue, AuthUser } from "./types";

/**
 * Provider의 단일 Query를 재조회합니다. 만료 쿠키의 갱신/동시 요청 공유는 apiClient 책임입니다.
 * 오류 때 남은 캐시 user를 갱신 성공으로 취급하지 않고 로그아웃·계정 변경 후의 결과도 거절합니다.
 */
export async function recoverServerSession(refetch: AuthContextValue["refetch"]): Promise<AuthUser | null> {
  const generation = getAuthGeneration();
  const result = await refetch({ cancelRefetch: false });
  assertAuthGeneration(generation);
  const failure = result.error ?? result.data?.failure;
  if (failure) throw failure;
  return result.data?.user ?? null;
}
