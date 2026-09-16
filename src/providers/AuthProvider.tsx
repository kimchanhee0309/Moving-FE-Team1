"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

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
  // GNB·모달·역할 가드는 이 단일 /auth/me Query를 공유합니다. 계정 변경 중에는 자동 조회를 멈춥니다.
  const session = useQuery({
    queryKey: authKeys.session(),
    queryFn: ({ signal }) => fetchSession(signal),
    enabled: !isChangingSession,
    retry: false,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => query.state.data?.user ? 5 * 60_000 : false,
  });
  const refetchSession = session.refetch;

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

  // 다른 계정의 화면/개인 데이터가 새 인증 결과와 섞이지 않도록 mutation 전에 조회를 취소합니다.
  const prepareSessionChange = useCallback(async () => {
    setIsChangingSession(true);
    await client.cancelQueries();
    removePrivateCaches();
  }, [client, removePrivateCaches]);

  // AuthController → 이 mutation → 가입/로그인 API → 최신 /me 확인 → 단일 세션 캐시 반영 순서입니다.
  const credentials = useMutation({
    mutationFn: authenticateCredentials,
    onMutate: prepareSessionChange,
    onSuccess: async ({ user }) => {
      await client.cancelQueries();
      removePrivateCaches();
      client.setQueryData<AuthSession>(authKeys.session(), { user, failure: null });
      // 쿠키 변경 전의 서버 렌더가 남지 않도록 갱신합니다. 성공 후 목적지 이동은 기존 화면이 담당합니다.
      router.refresh();
    },
    onSettled: () => { setIsChangingSession(false); },
  });

  // 서버 쿠키 삭제 성공 후에만 비회원으로 확정합니다. 실패 시 /me로 실제 세션을 다시 확인합니다.
  const logout = useMutation({
    mutationFn: logoutSession,
    onMutate: prepareSessionChange,
    onSuccess: async () => {
      await client.cancelQueries();
      credentials.reset();
      removePrivateCaches();
      client.setQueryData<AuthSession>(authKeys.session(), { user: null, failure: null });
      router.replace(ROUTES.HOME);
      router.refresh();
    },
    onError: async () => { await refetchSession(); },
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
    // 연결 실패만으로 로그아웃을 확정하지 않습니다. 마지막 사용자 표시는 유지하고 오류 status로 접근을 막습니다.
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

  // 프로필 API 담당자는 저장 성공 후 호출합니다. 서버와 클라이언트의 profileCompleted를 함께 갱신합니다.
  const refetchUser = useCallback(async () => {
    const result = await refetchSession();
    const failure = result.error ?? result.data?.failure;
    if (failure) throw failure;
    router.refresh();
    return result.data?.user ?? null;
  }, [refetchSession, router]);

  const checkAccess = useCallback(
    (role: Parameters<AuthContextValue["checkAccess"]>[0], allowIncompleteProfile?: boolean) =>
      getAuthAccess(user, status, role, allowIncompleteProfile),
    [status, user],
  );

  // pathname 변화만으로 Context identity가 바뀌어 GNB·AuthGuard 전체가 다시 렌더되지 않도록 합니다.
  const auth = useMemo<AuthContextValue>(() => ({
    user,
    status,
    isPending,
    isLoading: isPending,
    isAuthenticated,
    error,
    credentials,
    logout,
    refetch: refetchSession,
    refetchUser,
    checkAccess,
  }), [checkAccess, credentials, error, isAuthenticated, isPending, logout, refetchSession, refetchUser, status, user]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
