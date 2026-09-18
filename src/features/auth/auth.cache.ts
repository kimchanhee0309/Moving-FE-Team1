import type { QueryClient } from "@tanstack/react-query";

import type { AuthSession, AuthUser } from "@/common/auth/types";

import { authKeys } from "./auth.keys";

/** 도메인 저장 성공 직후 전역 인증 표시를 갱신하고, 이후 /auth/me 재조회 결과로 다시 검증합니다. */
export function patchCachedAuthUser(
  queryClient: QueryClient,
  changes: Partial<Pick<AuthUser, "name" | "email" | "phone" | "profileCompleted">>,
): void {
  queryClient.setQueryData<AuthSession>(authKeys.session(), (current) =>
    current?.user
      ? { ...current, user: { ...current.user, ...changes } }
      : current,
  );
}
