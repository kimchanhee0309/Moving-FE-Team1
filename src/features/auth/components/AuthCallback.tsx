"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "../hooks/useAuth";
import { authHref, authNavigationTarget, resolveAuthenticatedPath } from "../auth.utils";

const MESSAGES = {
  OAUTH_CANCELLED: "oauthCancelled",
  OAUTH_INVALID_STATE: "oauthInvalidState",
  OAUTH_ACCOUNT_CONFLICT: "oauthAccountConflict",
  ROLE_MISMATCH: "roleMismatch",
  OAUTH_EMAIL_REQUIRED: "oauthEmailRequired",
  OAUTH_EMAIL_UNVERIFIED: "oauthEmailUnverified",
  OAUTH_PROVIDER_ERROR: "oauthProviderError",
  OAUTH_CODE_MISSING: "oauthCodeMissing",
  OAUTH_NOT_CONFIGURED: "socialNotReady",
  OAUTH_PROVIDER_UNSUPPORTED: "oauthProviderUnsupported",
  AUTH_RATE_LIMIT_EXCEEDED: "authRateLimitExceeded",
} as const;

function isCallbackErrorCode(value: string): value is keyof typeof MESSAGES {
  return Object.hasOwn(MESSAGES, value);
}

/**
 * 백엔드 OAuth callback이 이동시키는 프론트 /auth/callback의 처리 화면입니다.
 * error query는 허용된 코드의 안내에만 사용하고, 성공은 Provider의 최신 /auth/me 결과로 검증합니다.
 * role 일치와 profileCompleted를 확인한 뒤 안전한 목적지로 이동합니다. 공급자 code 교환은 하지 않습니다.
 */
export function AuthCallback({ error, role, redirect }: { error?: string; role?: string; redirect?: string }) {
  const t = useTranslations("Auth");
  const common = useTranslations("Common");
  const { refetch } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [verificationError, setVerificationError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const callbackLocale = authNavigationTarget(redirect ?? "/", locale).locale;

  useEffect(() => {
    if (error) return;
    let active = true;
    void refetch().then((result) => {
      if (!active) return;
      const session = result.data;
      const failure = result.error ?? session?.failure;
      if (failure) {
        setVerificationError(failure instanceof TypeError ? t("networkError") : t("sessionCheckFailed"));
      } else if (!session?.user) {
        setVerificationError(t("sessionUnavailable"));
      } else if ((role === "CUSTOMER" || role === "MOVER") && role !== session.user.role) {
        setVerificationError(t("roleMismatch"));
      } else {
        const target = authNavigationTarget(resolveAuthenticatedPath(session.user, redirect), callbackLocale);
        router.replace(target.href, { locale: target.locale });
      }
    }).catch(() => {
      if (active) setVerificationError(t("sessionRetryFailed"));
    });
    return () => { active = false; };
  }, [error, role, redirect, refetch, router, attempt, callbackLocale, t]);

  const message = error ? t(isCallbackErrorCode(error) ? MESSAGES[error] : "callbackFailure") : verificationError;
  const login = role === "MOVER" ? "/login/mover" : "/login/customer";
  return <main className="mx-auto max-w-xl px-6 py-20 text-center">
    <h1 className="text-2xl-bold">{t("socialLogin")}</h1>
    <p className="my-6" role={message ? "alert" : "status"}>{message || t("callbackChecking")}</p>
    {message && <Link className="text-(--primary-400) underline" href={authHref(login, redirect)} locale={callbackLocale}>{t("backToLogin")}</Link>}
    {!error && verificationError && <button type="button" className="ml-4 underline" onClick={() => { setVerificationError(""); setAttempt((value) => value + 1); }}>{common("checkAgain")}</button>}
  </main>;
}
