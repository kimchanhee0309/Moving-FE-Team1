"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import type { UserRole } from "@/common/auth/types";
import { ROUTES } from "@/common/constants/routes";
import { authHref, resolveAuthenticatedPath } from "../auth.utils";
import { useAuth } from "../hooks/useAuth";

interface AuthGuardProps {
  role: UserRole;
  children: ReactNode;
}

/** 역할 라우트 그룹의 화면 이동만 안내합니다. Refresh와 API 인가는 여기서 처리하지 않습니다. */
export function AuthGuard({ role, children }: AuthGuardProps) {
  const { user, status, error, refetch, checkAccess } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const loginPath = ROUTES.AUTH.LOGIN[role];
  const profileRegister = role === "MOVER"
    ? ROUTES.MOVER.PROFILE.REGISTER : ROUTES.CUSTOMER.PROFILE.REGISTER;
  const access = checkAccess(role, path === profileRegister);
  const login = authHref(loginPath, path);
  const hasRegisteredProfile = access === "allowed" && user?.profileCompleted && path === profileRegister;

  useEffect(() => {
    if (access === "guest") {
      // 경로가 렌더링될 때는 브라우저 query까지 보존하여 로그인 후 원래 목적지로 복귀합니다.
      router.replace(authHref(loginPath, path + window.location.search));
    } else if (access === "profile-required") {
      router.replace(profileRegister);
    } else if (hasRegisteredProfile && user) {
      router.replace(resolveAuthenticatedPath(user));
    }
  }, [access, hasRegisteredProfile, loginPath, path, profileRegister, router, user]);

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
      프로필 등록 화면으로 이동하고 있습니다. <Link href={profileRegister} className="underline">프로필 등록</Link>
    </p>;
  }
  if (hasRegisteredProfile) {
    return <p role="status" className="p-8 text-center">프로필 등록이 완료되어 이동하고 있습니다.</p>;
  }
  return children;
}
