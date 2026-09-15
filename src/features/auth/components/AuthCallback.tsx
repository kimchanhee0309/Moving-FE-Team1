"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { authHref, resolveAuthenticatedPath } from "../auth.utils";

const MESSAGES: Record<string, string> = {
  OAUTH_CANCELLED: "SNS 로그인이 취소되었습니다.",
  OAUTH_INVALID_STATE: "로그인 요청이 만료되었거나 유효하지 않습니다. 다시 시작해 주세요.",
  OAUTH_ACCOUNT_CONFLICT: "같은 이메일로 가입된 계정이 있습니다. 기존 로그인 방법을 이용해 주세요.",
  ROLE_MISMATCH: "가입한 계정 유형의 로그인 페이지를 이용해 주세요.",
  OAUTH_EMAIL_REQUIRED: "SNS 계정의 이메일 제공 동의가 필요합니다.",
  OAUTH_EMAIL_UNVERIFIED: "SNS 계정의 이메일 인증을 완료한 뒤 다시 시도해 주세요.",
  OAUTH_PROVIDER_ERROR: "SNS 공급자와 연결하지 못했습니다. 다시 시도해 주세요.",
  OAUTH_CODE_MISSING: "SNS 인증 정보를 받지 못했습니다. 로그인을 다시 시작해 주세요.",
  OAUTH_NOT_CONFIGURED: "SNS 로그인 준비 중입니다. 이메일 로그인을 이용해 주세요.",
  OAUTH_PROVIDER_UNSUPPORTED: "지원하지 않는 SNS 로그인입니다.",
  AUTH_RATE_LIMIT_EXCEEDED: "요청이 많습니다. 잠시 후 다시 시도해 주세요.",
};

/**
 * 백엔드 OAuth callback이 이동시키는 프론트 /auth/callback의 처리 화면입니다.
 * error query는 허용된 코드의 안내에만 사용하고, 성공은 Provider의 최신 /auth/me 결과로 검증합니다.
 * role 일치와 profileCompleted를 확인한 뒤 안전한 목적지로 이동합니다. 공급자 code 교환은 하지 않습니다.
 */
export function AuthCallback({ error, role, redirect }: { error?: string; role?: string; redirect?: string }) {
  const { refetch } = useAuth();
  const router = useRouter();
  const [verificationError, setVerificationError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (error) return;
    let active = true;
    void refetch().then((result) => {
      if (!active) return;
      const session = result.data;
      const failure = result.error ?? session?.failure;
      if (failure) {
        setVerificationError(failure instanceof TypeError ? "서버에 연결하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요." : "인증 상태를 확인하지 못했습니다. 다시 로그인해 주세요.");
      } else if (!session?.user) {
        setVerificationError("로그인 세션을 확인하지 못했습니다. 다시 로그인해 주세요.");
      } else if ((role === "CUSTOMER" || role === "MOVER") && role !== session.user.role) {
        setVerificationError(MESSAGES.ROLE_MISMATCH);
      } else {
        router.replace(resolveAuthenticatedPath(session.user, redirect));
      }
    }).catch(() => {
      if (active) setVerificationError("인증 상태를 확인하지 못했습니다. 다시 시도해 주세요.");
    });
    return () => { active = false; };
  }, [error, role, redirect, refetch, router, attempt]);

  const message = error ? Object.hasOwn(MESSAGES, error) ? MESSAGES[error] : "SNS 로그인을 완료하지 못했습니다. 다시 시작해 주세요." : verificationError;
  const login = role === "MOVER" ? "/login/mover" : "/login/customer";
  return <main className="mx-auto max-w-xl px-6 py-20 text-center">
    <h1 className="text-2xl-bold">SNS 로그인</h1>
    <p className="my-6" role={message ? "alert" : "status"}>{message || "로그인 정보를 확인하고 있습니다."}</p>
    {message && <Link className="text-(--primary-400) underline" href={authHref(login, redirect)}>로그인 화면으로 돌아가기</Link>}
    {!error && verificationError && <button type="button" className="ml-4 underline" onClick={() => { setVerificationError(""); setAttempt((value) => value + 1); }}>다시 확인</button>}
  </main>;
}
