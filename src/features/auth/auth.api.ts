import { readOptionalUser, readUser } from "@/common/auth/user.mapper";
import { apiClient } from "@/common/api/client";
import { changeAuthSession, isGuestFailure } from "@/common/api/auth-session";
import { ApiError } from "@/common/api/error";
import type { AuthCredentialsRequest, AuthSession, AuthUser, UserRole } from "@/common/auth/types";
import type { AuthFormValues, AuthMode, SocialProvider } from "./auth.types";

/**
 * POST /auth/signup 또는 /auth/login 연동. 가입만 name/phone을 전송하고 role은 진입 화면에서 받습니다.
 * 확인 비밀번호는 화면 검증용이며, 토큰은 서버의 HttpOnly 쿠키로만 전달됩니다.
 * 쿠키 변경 중의 이전 요청 무효화는 changeAuthSession, 성공 캐시 반영은 AuthProvider가 담당합니다.
 * emailVerificationToken은 가입에서만 전송합니다. 값이 없으면 key 자체를 보내지 않아 로그인 DTO와 기존 가입 DTO 모양을 유지합니다.
 */
export async function submitCredentials(mode: AuthMode, role: UserRole, values: AuthFormValues, emailVerificationToken?: string): Promise<{ user: AuthUser }> {
  const payload = { email: values.email.trim().toLowerCase(), password: values.password, role,
    ...(mode === "signup" ? {
      name: values.name.trim(),
      phone: values.phone,
      ...(emailVerificationToken ? { emailVerificationToken } : {}),
    } : {}) };
  return changeAuthSession(async () => ({ user: readUser(await apiClient<unknown>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(payload) })) }));
}

/**
 * AuthProvider의 세션 Query와 callback에서 사용하는 POST /auth/refresh/session 연동입니다.
 * 쿠키 없는 최초 방문은 user null의 정상 비회원이며, 필요한 Access 복구는 백엔드가 Refresh로 처리합니다.
 * 네트워크 오류는 다시 던져 Query에 전달하며, 캐시 사용자 유지 여부는 Provider의 상태 판정에서 결정합니다.
 * Query가 전달한 signal로 로그아웃·계정 변경 전에 시작된 조회를 취소할 수 있습니다.
 */
export async function fetchSession(signal?: AbortSignal): Promise<AuthSession> {
  try {
    const data = await apiClient<unknown>("/auth/refresh/session", {
      method: "POST",
      signal,
      cache: "no-store",
    });
    return { user: readOptionalUser(data), failure: null };
  } catch (error) {
    if (isGuestFailure(error)) return { user: null, failure: null };
    if (error instanceof ApiError && error.status === 401) return { user: null, failure: error };
    throw error;
  }
}

/** 로그인·가입 직후에는 보호된 /auth/me로 실제 Access 쿠키 발급까지 확인합니다. */
async function fetchAuthenticatedSession(): Promise<AuthSession> {
  try {
    return {
      user: readUser(await apiClient<unknown>("/auth/me", { cache: "no-store" })),
      failure: null,
    };
  } catch (error) {
    if (isGuestFailure(error)) return { user: null, failure: null };
    if (error instanceof ApiError && error.status === 401) return { user: null, failure: error };
    throw error;
  }
}

/** POST /auth/logout으로 서버 쿠키만 삭제합니다. 사용자·개인 캐시 정리와 홈 이동은 AuthProvider 책임입니다. */
export const logoutSession = (): Promise<null> => changeAuthSession(() => apiClient<null>("/auth/logout", { method: "POST" }));

/** DELETE /auth/me로 본인 계정을 삭제하며 빈 문자열은 OAuth용 빈 Body로 전송합니다. */
export const withdrawAccountSession = (currentPassword: string): Promise<null> =>
  changeAuthSession(() => apiClient<null>("/auth/me", {
    method: "DELETE",
    body: JSON.stringify(currentPassword ? { currentPassword } : {}),
  }));

/** 화면의 만료 안내와 재발송 타이머에 쓰는 인증코드 발송 결과입니다. */
export interface SignupEmailCodeResult {
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

/**
 * POST /auth/signup/email-code 연동. 가입하려는 이메일로 6자리 인증코드를 요청합니다.
 * 이미 가입된 이메일(409 EMAIL_ALREADY_EXISTS)과 60초 내 재요청(429)은 ApiError로 전달하며 화면이 문구를 정합니다.
 */
export async function requestSignupEmailCode(email: string): Promise<SignupEmailCodeResult> {
  const result = await apiClient<SignupEmailCodeResult>("/auth/signup/email-code", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });
  if (!result || typeof result.expiresInSeconds !== "number" || typeof result.resendAfterSeconds !== "number") {
    throw new ApiError(200, "INVALID_RESPONSE", "이메일 인증 응답이 올바르지 않습니다.");
  }
  return { expiresInSeconds: result.expiresInSeconds, resendAfterSeconds: result.resendAfterSeconds };
}

/**
 * POST /auth/signup/email-code/verify 연동. 코드가 맞으면 가입 요청에 넣을 15분 만료 이메일 인증 토큰을 받습니다.
 * 이 토큰은 로그인 권한이 없는 가입 전용 값이며 저장소에 보관하지 않고 가입 화면의 메모리 상태로만 유지합니다.
 */
export async function verifySignupEmailCode(email: string, code: string): Promise<{ emailVerificationToken: string }> {
  const result = await apiClient<{ emailVerificationToken: string }>("/auth/signup/email-code/verify", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase(), code }),
  });
  if (!result || typeof result.emailVerificationToken !== "string" || !result.emailVerificationToken) {
    throw new ApiError(200, "INVALID_RESPONSE", "이메일 인증 응답이 올바르지 않습니다.");
  }
  return { emailVerificationToken: result.emailVerificationToken };
}

export interface AccountRecoveryInput {
  name: string;
  email: string;
  role: UserRole;
}

export interface PasswordResetCodeRequestResult {
  delivery: "EMAIL" | "SOCIAL" | "NONE";
  challengeId: string | null;
  expiresInSeconds: number | null;
  resendAfterSeconds: number | null;
}

export async function requestPasswordResetCode(input: AccountRecoveryInput): Promise<PasswordResetCodeRequestResult> {
  const result = await apiClient<PasswordResetCodeRequestResult>("/auth/recovery/password/code", {
    method: "POST",
    body: JSON.stringify({ ...input, email: input.email.trim().toLowerCase(), name: input.name.trim() }),
  });
  if (
    !result ||
    !["EMAIL", "SOCIAL", "NONE"].includes(result.delivery) ||
    (result.delivery === "EMAIL" && (typeof result.challengeId !== "string" || typeof result.expiresInSeconds !== "number" || typeof result.resendAfterSeconds !== "number"))
  ) {
    throw new ApiError(200, "INVALID_RESPONSE", "비밀번호 재설정 응답이 올바르지 않습니다.");
  }
  return result;
}

export async function verifyPasswordResetCode(challengeId: string, code: string): Promise<{ resetToken: string }> {
  const result = await apiClient<{ resetToken: string }>("/auth/recovery/password/code/verify", {
    method: "POST",
    body: JSON.stringify({ challengeId, code }),
  });
  if (!result || typeof result.resetToken !== "string") {
    throw new ApiError(200, "INVALID_RESPONSE", "비밀번호 재설정 응답이 올바르지 않습니다.");
  }
  return { resetToken: result.resetToken };
}

export async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  await apiClient<null>("/auth/recovery/password/confirm", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

/** 인증 쿠키가 실제로 전달되는지도 /me로 확인한 뒤 전역 사용자 상태에 반영합니다. */
export async function authenticateCredentials(input: AuthCredentialsRequest): Promise<{ user: AuthUser }> {
  await submitCredentials(input.mode, input.role, {
    email: input.email,
    password: input.password,
    name: input.mode === "signup" ? input.name : "",
    phone: input.mode === "signup" ? input.phone : "",
    passwordConfirm: "",
  }, input.mode === "signup" ? input.emailVerificationToken : undefined);
  const session = await fetchAuthenticatedSession();
  if (session.failure) throw session.failure;
  if (!session.user) {
    throw new ApiError(401, "AUTH_SESSION_UNAVAILABLE", input.mode === "signup"
      ? "계정은 생성됐지만 로그인 쿠키를 확인하지 못했습니다. 쿠키 설정을 확인한 뒤 로그인해 주세요."
      : "로그인 쿠키를 확인하지 못했습니다. 쿠키 설정을 확인해 주세요.");
  }
  return { user: session.user };
}

/**
 * GET /auth/oauth/:provider?format=json 연동. 백엔드가 state 쿠키와 공급자 인증 URL을 준비합니다.
 * AuthController가 URL로 이동하고, 공급자 callback/code 교환은 백엔드가 처리한 뒤 /auth/callback으로 보냅니다.
 * 프론트에는 Secret을 두지 않으며 응답 URL도 해당 공급자의 HTTPS 호스트인지 확인합니다.
 */
export async function beginSocialLogin(provider: SocialProvider, role: UserRole, redirect?: string): Promise<{ url: string }> {
  const data = await apiClient<unknown>(`/auth/oauth/${provider}`, { query: { role, redirect, format: "json" }, cache: "no-store" });
  if (typeof data !== "object" || data === null || !("url" in data) || typeof data.url !== "string") {
    throw new ApiError(200, "INVALID_RESPONSE", "SNS 인증 시작 응답이 올바르지 않습니다.");
  }
  const allowedHosts: Record<SocialProvider, string> = {
    google: "accounts.google.com", kakao: "kauth.kakao.com", naver: "nid.naver.com",
  };
  let url: URL;
  try { url = new URL(data.url); }
  catch { throw new ApiError(200, "INVALID_RESPONSE", "SNS 인증 주소가 올바르지 않습니다."); }
  if (url.protocol !== "https:" || url.hostname !== allowedHosts[provider] || url.username || url.password) {
    throw new ApiError(200, "INVALID_RESPONSE", "SNS 공급자의 인증 주소가 올바르지 않습니다.");
  }
  return { url: url.toString() };
}
