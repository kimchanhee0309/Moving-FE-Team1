import { ROUTES } from "@/common/constants/routes";

import type { AuthFormErrors, AuthFormValues, AuthMode, AuthUser } from "./auth.types";

/** 백엔드와 동일하게 앞뒤 공백과 하이픈만 제거합니다. 내부 문자/공백은 검증에서 거절합니다. */
export function normalizePhone(phone: string): string {
  return phone.trim().replace(/-/g, "");
}

/** 화면용 검증입니다. 서버의 계정 존재 여부/중복/비밀번호 일치는 판단하지 않습니다. */
export function validateAuthForm(values: AuthFormValues, mode: AuthMode): AuthFormErrors {
  const errors: AuthFormErrors = {};
  if (values.email.trim().length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "올바른 이메일 형식을 입력해 주세요.";
  }
  if (!values.password.trim()) errors.password = "비밀번호를 입력해 주세요.";

  // 로그인에서는 가입 정책 변경 전의 비밀번호도 서버가 판정할 수 있도록 존재 여부만 검사합니다.
  if (mode === "signup") {
    if (!values.name.trim() || values.name.trim().length > 50) errors.name = "성함을 1~50자로 입력해 주세요.";
    if (!/^01[016789]\d{7,8}$/.test(normalizePhone(values.phone))) {
      errors.phone = "올바른 휴대전화 번호를 입력해 주세요.";
    }
    const password = values.password.trim();
    if (password.length < 8 || new TextEncoder().encode(password).length > 72 || !/[a-zA-Z]/.test(password) || !/\d/.test(password) || !/[^a-zA-Z0-9\s]/.test(password)) {
      errors.password = "8자 이상·72바이트 이하이며 영문·숫자·특수문자가 필요합니다.";
    }
    if (!values.passwordConfirm || values.password !== values.passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
  }
  return errors;
}

/** redirect 파라미터로 외부 URL/프로토콜 상대 URL/역슬래시 경로를 전달하지 못하게 합니다. */
export function safeAuthRedirect(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return undefined;
  try {
    const url = new URL(value, "https://moving.local");
    return url.origin === "https://moving.local" && !/^\/(auth|login|signup)(\/|$)/.test(url.pathname) ? `${url.pathname}${url.search}${url.hash}` : undefined;
  } catch {
    return undefined;
  }
}

/** 로그인/회원가입 사이를 이동할 때 검증한 원래 목적지를 유지합니다. */
export function authHref(path: string, redirectTo?: string): string {
  const safePath = safeAuthRedirect(redirectTo);
  return safePath ? `${path}?${new URLSearchParams({ redirect: safePath })}` : path;
}

/** 인증 성공 뒤 프로필 미등록 사용자를 역할별 등록 화면으로 먼저 보냅니다. */
export function resolveAuthenticatedPath(user: AuthUser, redirectTo?: string): string {
  if (!user.profileCompleted) {
    return user.role === "MOVER"
      ? ROUTES.MOVER.PROFILE.REGISTER
      : ROUTES.CUSTOMER.PROFILE.REGISTER;
  }

  const target = safeAuthRedirect(redirectTo);
  const defaultPath = user.role === "MOVER" ? ROUTES.MOVER.MY_PAGE : ROUTES.PUBLIC.MOVER_SEARCH;
  if (!target) return defaultPath;
  const pathname = new URL(target, "https://moving.local").pathname;
  const ownPaths = user.role === "MOVER"
    ? ["/mover-profile", "/mover-mypage", "/requests", "/mover-quote"]
    : ["/customer-profile", "/move-request", "/customer-quote", "/favorite", "/review"];
  const isPublic = pathname === ROUTES.HOME || pathname === ROUTES.PUBLIC.MOVER_SEARCH || pathname.startsWith(`${ROUTES.PUBLIC.MOVER_SEARCH}/`);
  const isOwn = ownPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isRegister = pathname === ROUTES.CUSTOMER.PROFILE.REGISTER || pathname === ROUTES.MOVER.PROFILE.REGISTER;
  return (isPublic || isOwn) && !isRegister ? target : defaultPath;
}
