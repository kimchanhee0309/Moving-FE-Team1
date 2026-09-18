"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";

import type { UserRole } from "@/common/auth/types";
import { ROUTES } from "@/common/constants/routes";
import { authHref, resolveAuthenticatedPath } from "../auth.utils";
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
  return <Suspense fallback={<p role="status" className="p-8 text-center">로그인 정보를 확인하고 있습니다.</p>}>
    <AuthGuardContent role={role}>{children}</AuthGuardContent>
  </Suspense>;
}

function AuthGuardContent({ role, children }: AuthGuardProps) {
  const { user, status, error, refetch, checkAccess } = useAuth();
  const path = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const destination = query ? `${path}?${query}` : path;
  const router = useRouter();
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
      router.replace(resolveAuthenticatedPath(user, profileRedirect));
    }
  }, [access, hasRegisteredProfile, login, profileRedirect, profileRegisterHref, router, user]);

  if (access === "loading") {
    return <p role="status" className="p-8 text-center">로그인 정보를 확인하고 있습니다.</p>;
  }
  if (access === "unavailable") {
    return <div role="alert" className="p-8 text-center">
      <p>{status === "auth-error"
        ? "인증이 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요."
        : status === "network-error"
          ? "서버에 연결하지 못했습니다. 네트워크 연결을 확인해 주세요."
          : "로그인 정보를 확인하지 못했습니다. 다시 시도해 주세요."}</p>
      {status === "auth-error"
        ? <Link href={login} className="underline">로그인</Link>
        : <button type="button" className="underline" onClick={() => void refetch()}>다시 확인</button>}
    </div>;
  }
  if (access === "guest" || error) return null;
  if (access === "role-mismatch") {
    return <p role="alert" className="p-8 text-center">
      현재 계정으로 이용할 수 없는 페이지입니다. <Link href={ROUTES.HOME} className="underline">홈으로 이동</Link>
    </p>;
  }
  if (access === "profile-required") {
    return <p role="status" className="p-8 text-center">
      프로필 등록 화면으로 이동하고 있습니다. <Link href={profileRegisterHref} className="underline">프로필 등록</Link>
    </p>;
  }
  if (hasRegisteredProfile) {
    return <p role="status" className="p-8 text-center">프로필 등록이 완료되어 이동하고 있습니다.</p>;
  }
  return children;
}
