import { apiClient } from "@/common/api/client";
import { changeAuthSession, isGuestFailure } from "@/common/api/auth-session";
import { ApiError } from "@/common/api/error";
import type { AuthCredentialsRequest, AuthSession, AuthUser, UserRole } from "@/common/auth/types";
import type { AuthFormValues, AuthMode, SocialProvider } from "./auth.types";

function readUser(data: unknown): AuthUser {
  if (typeof data === "object" && data !== null && "user" in data) {
    const user = data.user;
    if (typeof user === "object" && user !== null && "id" in user && typeof user.id === "string" &&
      "name" in user && typeof user.name === "string" && "email" in user && typeof user.email === "string" &&
      "phone" in user && (user.phone === null || typeof user.phone === "string") &&
      "role" in user && (user.role === "CUSTOMER" || user.role === "MOVER") &&
      "profileCompleted" in user && typeof user.profileCompleted === "boolean") {
      return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, profileCompleted: user.profileCompleted };
    }
  }
  throw new ApiError(200, "INVALID_RESPONSE", "사용자 응답 형식이 올바르지 않습니다.");
}

/** 화면 입력을 실제 DTO로 매핑하며 확인 비밀번호와 토큰은 전송하지 않습니다. */
export async function submitCredentials(mode: AuthMode, role: UserRole, values: AuthFormValues): Promise<{ user: AuthUser }> {
  const payload = { email: values.email.trim().toLowerCase(), password: values.password, role,
    ...(mode === "signup" ? { name: values.name.trim(), phone: values.phone } : {}) };
  return changeAuthSession(async () => ({ user: readUser(await apiClient<unknown>(`/auth/${mode}`, { method: "POST", body: JSON.stringify(payload) })) }));
}

export async function fetchSession(signal?: AbortSignal): Promise<AuthSession> {
  try {
    return { user: readUser(await apiClient<unknown>("/auth/me", { signal, cache: "no-store" })), failure: null };
  } catch (error) {
    if (isGuestFailure(error)) return { user: null, failure: null };
    if (error instanceof ApiError && error.status === 401) return { user: null, failure: error };
    throw error;
  }
}

export const logoutSession = (): Promise<null> => changeAuthSession(() => apiClient<null>("/auth/logout", { method: "POST" }));

/** 인증 쿠키가 실제로 전달되는지도 /me로 확인한 뒤 전역 사용자 상태에 반영합니다. */
export async function authenticateCredentials(input: AuthCredentialsRequest): Promise<{ user: AuthUser }> {
  await submitCredentials(input.mode, input.role, {
    email: input.email,
    password: input.password,
    name: input.mode === "signup" ? input.name : "",
    phone: input.mode === "signup" ? input.phone : "",
    passwordConfirm: "",
  });
  const session = await fetchSession();
  if (session.failure) throw session.failure;
  if (!session.user) {
    throw new ApiError(401, "AUTH_SESSION_UNAVAILABLE", input.mode === "signup"
      ? "계정은 생성됐지만 로그인 쿠키를 확인하지 못했습니다. 쿠키 설정을 확인한 뒤 로그인해 주세요."
      : "로그인 쿠키를 확인하지 못했습니다. 쿠키 설정을 확인해 주세요.");
  }
  return { user: session.user };
}

/** 공급자 Secret과 code 교환은 서버가 담당하고 이 함수는 시작 URL만 받습니다. */
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
