"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";

import { useAuth } from "@/common/auth/AuthContext";
import { recoverServerSession } from "@/common/auth/recover-server-session";
import type { UserRole } from "@/common/auth/types";
import { useRouter } from "@/i18n/navigation";

import { AuthGuard } from "./AuthGuard";

interface ServerSessionRecoveryProps {
  role: UserRole;
  hasServerAccess: boolean;
  /** guest/unavailable처럼 세션 재조회로 달라질 수 있는 서버 판정에만 true입니다. */
  shouldRecoverSession: boolean;
  children?: ReactNode;
}

/**
 * 복구 가능한 서버 조회 실패만 Provider Query로 한 번 확인한 뒤 router.refresh로 서버 렌더를 재요청합니다.
 * 역할 불일치와 프로필 미등록은 같은 사용자를 재조회해도 바뀌지 않으므로 자동 복구하지 않습니다.
 * Refresh를 직접 호출하거나 사용자 사본을 저장하지 않습니다. 자동 재조회는 마운트당 한 번만 합니다.
 * 서버 재조회에도 쿠키가 전달되지 않으면 수동 재시도를 안내해 무한 새로고침을 막습니다.
 */
export function ServerSessionRecovery({ role, hasServerAccess, shouldRecoverSession, children }: ServerSessionRecoveryProps) {
  const t = useTranslations("Auth");
  const common = useTranslations("Common");
  const { refetch } = useAuth();
  const router = useRouter();
  const [isTransitionPending, startTransition] = useTransition();
  const [isChecking, setIsChecking] = useState(!hasServerAccess && shouldRecoverSession);
  const [error, setError] = useState<Error | null>(null);
  const attempted = useRef(false);
  const mounted = useRef(false);
  const running = useRef(false);

  const recover = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    try {
      const user = await recoverServerSession(refetch);
      if (!mounted.current) return;
      if (user) startTransition(() => router.refresh());
    } catch (failure) {
      if (mounted.current && !(failure instanceof DOMException && failure.name === "AbortError")) {
        setError(failure instanceof Error ? failure : new Error("인증 정보를 확인하지 못했습니다."));
      }
    } finally {
      running.current = false;
      if (mounted.current) setIsChecking(false);
    }
  }, [refetch, router]);

  useEffect(() => {
    mounted.current = true;
    if (!hasServerAccess && shouldRecoverSession && !attempted.current) {
      attempted.current = true;
      void recover();
    }
    return () => { mounted.current = false; };
  }, [hasServerAccess, recover, shouldRecoverSession]);

  if (!hasServerAccess && (isChecking || isTransitionPending)) {
    return <p role="status" className="p-8 text-center">{t("rechecking")}</p>;
  }

  return <AuthGuard role={role}>
    {hasServerAccess ? children : <div role="alert" className="p-8 text-center">
      <p>{error instanceof TypeError
        ? t("networkError")
        : t("serverSessionFailed")}</p>
      <button type="button" className="underline" disabled={isChecking || isTransitionPending}
        onClick={() => { setError(null); setIsChecking(true); void recover(); }}>{common("checkAgain")}</button>
    </div>}
  </AuthGuard>;
}
