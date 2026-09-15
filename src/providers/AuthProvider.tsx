"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type PropsWithChildren } from "react";

import { isGuestFailure, subscribeAuthFailure } from "@/common/api/auth-session";
import { AuthContext } from "@/common/auth/AuthContext";
import { getAuthAccess } from "@/common/auth/access";
import { getAuthSessionState } from "@/common/auth/session";
import type { AuthContextValue, AuthSession } from "@/common/auth/types";
import { ROUTES } from "@/common/constants/routes";
import { authenticateCredentials, fetchSession, logoutSession } from "@/features/auth/auth.api";
import { authKeys } from "@/features/auth/auth.keys";

/**
 * 전역 인증 Query와 이메일 인증·로그아웃을 소유합니다.
 * 사용자 사본을 별도 state에 저장하지 않고, 모달과 모든 라우트 그룹에 같은 Query 결과를 제공합니다.
 * 토큰 갱신은 공통 API client에, 실제 인가는 백엔드에 맡깁니다.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const client = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const [isChangingSession, setIsChangingSession] = useState(false);
  const session = useQuery({
    queryKey: authKeys.session(),
    queryFn: ({ signal }) => fetchSession(signal),
    enabled: !isChangingSession,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => query.state.data?.user ? 5 * 60_000 : false,
  });

  const removePrivateCaches = useCallback(() => {
    // 공개 표시가 없는 캐시는 계정 데이터일 수 있어 제거합니다. 진행 중 mutation의 상태는 보존합니다.
    client.removeQueries({
      predicate: (query) => query.queryKey[0] !== "auth" && query.meta?.public !== true,
    });
    const mutations = client.getMutationCache();
    mutations.getAll()
      .filter((mutation) => mutation.state.status !== "pending")
      .forEach((mutation) => mutations.remove(mutation));
  }, [client]);

  const prepareSessionChange = useCallback(async () => {
    setIsChangingSession(true);
    await client.cancelQueries();
    removePrivateCaches();
  }, [client, removePrivateCaches]);

  const credentials = useMutation({
    mutationFn: authenticateCredentials,
    onMutate: prepareSessionChange,
    onSuccess: async ({ user }) => {
      await client.cancelQueries();
      removePrivateCaches();
      client.setQueryData<AuthSession>(authKeys.session(), { user, failure: null });
    },
    onSettled: () => { setIsChangingSession(false); },
  });

  const logout = useMutation({
    mutationFn: logoutSession,
    onMutate: prepareSessionChange,
    onSuccess: async () => {
      await client.cancelQueries();
      credentials.reset();
      removePrivateCaches();
      client.setQueryData<AuthSession>(authKeys.session(), { user: null, failure: null });
      router.replace(ROUTES.HOME);
    },
    onError: async () => { await session.refetch(); },
    onSettled: () => { setIsChangingSession(false); },
  });

  const { isPending: isCredentialsPending, reset: resetCredentials } = credentials;
  useEffect(() => subscribeAuthFailure((failure) => {
    // 취소는 동기적으로 시작됩니다. 늦은 /me 응답과 개인 Query가 지운 세션을 복구하지 못하게 합니다.
    void client.cancelQueries();
    if (!isCredentialsPending) resetCredentials();
    removePrivateCaches();
    const error = isGuestFailure(failure)
      ? null
      : failure instanceof Error ? failure : new Error("인증 정보를 확인하지 못했습니다.");
    client.setQueryData<AuthSession>(authKeys.session(), (cached) => ({
      user: error instanceof TypeError ? cached?.user ?? null : null,
      failure: error,
    }));
  }), [client, isCredentialsPending, removePrivateCaches, resetCredentials]);

  const { isSuccess: hasLoggedOut, reset: resetLogout } = logout;
  useEffect(() => {
    if (hasLoggedOut && pathname === ROUTES.HOME) resetLogout();
  }, [hasLoggedOut, pathname, resetLogout]);

  // 로그아웃 후 홈 이동이 완료되기 전 역할 guard가 로그인 화면으로 덮어 이동하지 못하게 합니다.
  const isPending = session.isPending || isChangingSession || (hasLoggedOut && pathname !== ROUTES.HOME);
  const { user, status, error, isAuthenticated } = getAuthSessionState(session.data, session.error, isPending);
  const auth: AuthContextValue = {
    user,
    status,
    isPending,
    isLoading: isPending,
    isAuthenticated,
    error,
    credentials,
    logout,
    refetch: session.refetch,
    refetchUser: async () => {
      const result = await session.refetch();
      const failure = result.error ?? result.data?.failure;
      if (failure) throw failure;
      return result.data?.user ?? null;
    },
    checkAccess: (role, allowIncompleteProfile) => getAuthAccess(user, status, role, allowIncompleteProfile),
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
