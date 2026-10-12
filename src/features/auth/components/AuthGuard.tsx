"use client";

import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Suspense, useEffect, type ReactNode } from "react";

import type { UserRole } from "@/common/auth/types";
import { ROUTES } from "@/common/constants/routes";
import { authHref, authNavigationTarget, resolveAuthenticatedPath } from "../auth.utils";
import { useAuth } from "../hooks/useAuth";

interface AuthGuardProps {
  role: UserRole;
  children: ReactNode;
}

/**
 * (customer)/(mover) 레이아웃에서 역할별 화면 진입을 안내합니다. 공개 라우트에는 적용하지 않습니다.
 * 인증 조회·Refresh는 Provider/apiClient, 실제 데이터 인가는 백엔드 책임입니다.
 * 로그인 링크에 현재 query도 보존하며 useSearchParams의 정적 렌더링을 위해 Suspense 경계를 둡니다.
 */
export function AuthGuard({ role, children }: AuthGuardProps) {
  const t = useTranslations("Auth");
  return <Suspense fallback={<p role="status" className="p-8 text-center">{t("checkingSession")}</p>}>
    <AuthGuardContent role={role}>{children}</AuthGuardContent>
  </Suspense>;
}

function AuthGuardContent({ role, children }: AuthGuardProps) {
  const t = useTranslations("Auth");
  const common = useTranslations("Common");
  const { user, status, error, refetch, checkAccess } = useAuth();
  const path = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const destination = query ? `${path}?${query}` : path;
  const router = useRouter();
  const locale = useLocale();
  const loginPath = ROUTES.AUTH.LOGIN[role];
  const profileRegister = role === "MOVER"
    ? ROUTES.MOVER.PROFILE.REGISTER : ROUTES.CUSTOMER.PROFILE.REGISTER;
  const profileRedirect = searchParams.get("redirect") ?? undefined;
  const profileRegisterHref = authHref(profileRegister, destination);
  const access = checkAccess(role, path === profileRegister);
  const login = authHref(loginPath, destination);
  const hasRegisteredProfile = access === "allowed" && user?.profileCompleted && path === profileRegister;

  useEffect(() => {
    if (access === "guest") {
      router.replace(login);
    } else if (access === "profile-required") {
      router.replace(profileRegisterHref);
    } else if (hasRegisteredProfile && user) {
      const target = authNavigationTarget(resolveAuthenticatedPath(user, profileRedirect), locale);
      router.replace(target.href, { locale: target.locale });
    }
  }, [access, hasRegisteredProfile, locale, login, profileRedirect, profileRegisterHref, router, user]);

  if (access === "loading") {
    return <p role="status" className="p-8 text-center">{t("checkingSession")}</p>;
  }
  if (access === "unavailable") {
    return <div role="alert" className="p-8 text-center">
      <p>{status === "auth-error"
        ? t("sessionExpired")
        : status === "network-error"
          ? t("networkUnavailable")
          : t("sessionUnknown")}</p>
      {status === "auth-error"
        ? <Link href={login} className="underline">{common("login")}</Link>
        : <button type="button" className="underline" onClick={() => void refetch()}>{common("checkAgain")}</button>}
    </div>;
  }
  if (access === "guest" || error) return null;
  if (access === "role-mismatch") {
    return <p role="alert" className="p-8 text-center">
      {t("roleDenied")} <Link href={ROUTES.HOME} className="underline">{common("home")}</Link>
    </p>;
  }
  if (access === "profile-required") {
    return <p role="status" className="p-8 text-center">
      {t("profileRedirecting")} <Link href={profileRegisterHref} className="underline">{t("profileRegister")}</Link>
    </p>;
  }
  if (hasRegisteredProfile) {
    return <p role="status" className="p-8 text-center">{t("profileCompleteRedirecting")}</p>;
  }
  return children;
}
