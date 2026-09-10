import { ROUTES } from "@/common/constants/routes";

import type { AuthFormErrors, AuthFormValues, AuthMode, AuthUser } from "./auth.types";

/** 한국 전화번호는 공백/하이픈만 제거합니다. 문자까지 제거해 잘못된 입력을 허용하지 않습니다. */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

/** 화면용 검증입니다. 서버의 계정 존재 여부/중복/비밀번호 일치는 판단하지 않습니다. */
export function validateAuthForm(values: AuthFormValues, mode: AuthMode): AuthFormErrors {
  const errors: AuthFormErrors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "올바른 이메일 형식을 입력해 주세요.";
  }
  if (!values.password) errors.password = "비밀번호를 입력해 주세요.";

  // 로그인에서는 가입 정책 변경 전의 비밀번호도 서버가 판정할 수 있도록 존재 여부만 검사합니다.
  if (mode === "signup") {
    if (!values.name.trim()) errors.name = "성함을 입력해 주세요.";
    if (!/^(?:010\d{8}|01[16789]\d{7,8}|02\d{7,8}|0(?:[3-6][1-5]|70)\d{7,8})$/.test(normalizePhone(values.phone))) {
      errors.phone = "올바른 전화번호를 입력해 주세요.";
    }
    if (values.password.length < 8 || !/[a-zA-Z]/.test(values.password) || !/\d/.test(values.password) || !/[^a-zA-Z0-9\s]/.test(values.password) || /\s/.test(values.password)) {
      errors.password = /\s/.test(values.password)
        ? "비밀번호에 공백을 사용할 수 없습니다."
        : "8자 이상, 영문·숫자·특수문자가 필요합니다.";
    }
    if (!values.passwordConfirm || values.password !== values.passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
  }
  return errors;
}

/** redirect 파라미터로 외부 URL/프로토콜 상대 URL/역슬래시 경로를 전달하지 못하게 합니다. */
export function safeAuthRedirect(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return undefined;
  try {
    const url = new URL(value, "https://moving.local");
    return url.origin === "https://moving.local" ? `${url.pathname}${url.search}${url.hash}` : undefined;
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
  return target && !/^\/(auth|login|signup)(\/|$)/.test(target) ? target : ROUTES.HOME;
}
