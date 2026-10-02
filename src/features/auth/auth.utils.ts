import { ROUTES } from "@/common/constants/routes";
import { getEmailError } from "@/common/validation/email";
import { getNameError } from "@/common/validation/name";
import { getNewPasswordError } from "@/common/validation/password";
import { routing } from "@/i18n/routing";

import type { AuthField, AuthFormErrors, AuthFormValues, AuthMode, AuthUser } from "./auth.types";

/** 백엔드와 동일하게 앞뒤 공백과 하이픈만 제거합니다. 내부 문자/공백은 검증에서 거절합니다. */
export function normalizePhone(phone: string): string {
  return phone.trim().replace(/-/g, "");
}

/** 입력을 다시 시작한 필드의 서버 오류 키를 제거해 클라이언트 검증 오류를 가리지 않게 합니다. */
export function clearAuthFieldError(errors: AuthFormErrors, field: AuthField): AuthFormErrors {
  if (!(field in errors)) return errors;
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

/** 화면용 검증입니다. 서버의 계정 존재 여부/중복/비밀번호 일치는 판단하지 않습니다. */
export function validateAuthForm(values: AuthFormValues, mode: AuthMode): AuthFormErrors {
  const errors: AuthFormErrors = {};
  const emailError = getEmailError(values.email);
  if (emailError) errors.email = emailError;
  if (!values.password.trim()) errors.password = "비밀번호를 입력해 주세요.";

  // 로그인에서는 가입 정책 변경 전의 비밀번호도 서버가 판정할 수 있도록 존재 여부만 검사합니다.
  if (mode === "signup") {
    const nameError = getNameError(values.name);
    if (nameError) errors.name = nameError;
    if (!/^(?:010\d{8}|01[16789]\d{7,8})$/.test(normalizePhone(values.phone))) {
      errors.phone = "올바른 휴대전화 번호를 입력해 주세요.";
    }
    const password = values.password.trim();
    const passwordError = getNewPasswordError(password);
    if (passwordError) errors.password = passwordError;
    if (!values.passwordConfirm || values.password !== values.passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
    if (!values.recoveryQuestion) errors.recoveryQuestion = "복구 질문을 선택해 주세요.";
    const normalizedAnswer = values.recoveryAnswer.normalize("NFKC").trim();
    if (normalizedAnswer.length < 2 || normalizedAnswer.length > 100) {
      errors.recoveryAnswer = "복구 답변은 2~100자로 입력해 주세요.";
    }
  }
  return errors;
}

// routing.locales에서 만들어 locale을 추가해도 redirect 접두어 판정이 함께 바뀌게 합니다.
const LOCALE_PREFIX_PATTERN = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

type AppLocale = (typeof routing.locales)[number];

function toAppLocale(value: string): AppLocale {
  return routing.locales.find((locale) => locale === value) ?? routing.defaultLocale;
}

/** redirect 파라미터로 외부 URL/프로토콜 상대 URL/역슬래시 경로를 전달하지 못하게 합니다. */
export function safeAuthRedirect(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return undefined;
  try {
    const url = new URL(value, "https://moving.local");
    const pathname = url.pathname.replace(LOCALE_PREFIX_PATTERN, "") || "/";
    return url.origin === "https://moving.local" && !/^\/(auth|login|signup)(\/|$)/.test(pathname) ? `${url.pathname}${url.search}${url.hash}` : undefined;
  } catch {
    return undefined;
  }
}

/** OAuth의 루트 callback으로 돌아온 뒤에도 시작 언어를 복원합니다. */
export function authNavigationTarget(path: string, fallbackLocale: string) {
  const url = new URL(path, "https://moving.local");
  const prefix = LOCALE_PREFIX_PATTERN.exec(url.pathname);
  const locale = prefix?.[1] ?? fallbackLocale;
  const pathname = prefix ? url.pathname.slice(prefix[0].length) || "/" : url.pathname;
  return {
    href: `${pathname}${url.search}${url.hash}`,
    locale: toAppLocale(locale),
  };
}

export function localizedAuthRedirect(path: string, locale: string) {
  const safePath = safeAuthRedirect(path);
  if (!safePath) return undefined;
  const { href } = authNavigationTarget(safePath, locale);
  const appLocale = toAppLocale(locale);
  return appLocale === routing.defaultLocale ? href : `/${appLocale}${href === "/" ? "" : href}`;
}

/** 로그인/회원가입 사이를 이동할 때 검증한 원래 목적지를 유지합니다. */
export function authHref(path: string, redirectTo?: string): string {
  const safePath = safeAuthRedirect(redirectTo);
  return safePath ? `${path}?${new URLSearchParams({ redirect: safePath })}` : path;
}

/** 인증 성공 뒤 프로필 미등록 사용자를 역할별 등록 화면으로 먼저 보냅니다. */
export function resolveAuthenticatedPath(user: AuthUser, redirectTo?: string): string {
  if (!user.profileCompleted) {
    const registerPath = user.role === "MOVER"
      ? ROUTES.MOVER.PROFILE.REGISTER
      : ROUTES.CUSTOMER.PROFILE.REGISTER;
    return authHref(registerPath, redirectTo);
  }

  const target = safeAuthRedirect(redirectTo);
  const defaultPath = user.role === "MOVER" ? ROUTES.MOVER.MY_PAGE : ROUTES.PUBLIC.MOVER_SEARCH;
  if (!target) return defaultPath;
  const pathname = new URL(authNavigationTarget(target, routing.defaultLocale).href, "https://moving.local").pathname;
  const ownPaths = user.role === "MOVER"
    ? ["/mover-profile", "/mover-mypage", "/requests", "/mover-quote"]
    : ["/customer-profile", "/move-request", "/customer-quote", "/favorite", "/review"];
  const isPublic = pathname === ROUTES.HOME || pathname === ROUTES.PUBLIC.MOVER_SEARCH || pathname.startsWith(`${ROUTES.PUBLIC.MOVER_SEARCH}/`);
  const isOwn = ownPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isRegister = pathname === ROUTES.CUSTOMER.PROFILE.REGISTER || pathname === ROUTES.MOVER.PROFILE.REGISTER;
  return (isPublic || isOwn) && !isRegister ? target : defaultPath;
}

/**
 * 이메일 회원가입은 백엔드가 역할 프로필을 만들지 않으므로, 응답/캐시의 완료 플래그와 무관하게
 * 최초 1회는 반드시 역할별 프로필 등록 화면으로 보냅니다. 로그인은 서버의 최신 완료 상태를 따릅니다.
 */
export function resolveCredentialsPath(
  mode: AuthMode,
  user: AuthUser,
  redirectTo?: string,
): string {
  if (mode === "signup") {
    const registerPath = user.role === "MOVER"
      ? ROUTES.MOVER.PROFILE.REGISTER
      : ROUTES.CUSTOMER.PROFILE.REGISTER;
    return authHref(registerPath, redirectTo);
  }

  return resolveAuthenticatedPath(user, redirectTo);
}
