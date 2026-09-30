import type { QueryClient } from "@tanstack/react-query";

import type { AuthSession, AuthUser } from "@/common/auth/types";

import { authKeys } from "./auth.keys";

const PROFILE_COMPLETION_CONFIRMATION_ERROR =
  "프로필 등록 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.";

/** 프로필 저장 뒤 최신 세션이 완료 상태를 명시적으로 확인한 경우에만 다음 화면 진입을 허용합니다. */
export function assertProfileCompleted(
  user: Pick<AuthUser, "profileCompleted"> | null,
): asserts user is Pick<AuthUser, "profileCompleted"> & { profileCompleted: true } {
  if (user?.profileCompleted !== true) {
    throw new Error(PROFILE_COMPLETION_CONFIRMATION_ERROR);
  }
}

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
