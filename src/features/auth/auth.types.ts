import type { UserRole } from "@/common/auth/types";

export type AuthMode = "login" | "signup";
export type SocialProvider = "google" | "kakao" | "naver";

/** 백엔드 publicUser DTO. 토큰은 HttpOnly 쿠키에만 있고 이 모델에는 포함되지 않습니다. */
export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  profileCompleted: boolean;
}

/** 화면 입력 모델입니다. auth.api에서 요청 DTO로 매핑하며 확인 비밀번호는 전송하지 않습니다. */
export interface AuthFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
}
export type AuthField = keyof AuthFormValues;
export type AuthFormErrors = Partial<Record<AuthField, string>>;

export interface AuthScreenProps {
  role: UserRole;
  mode: AuthMode;
  /** 서버에서 검증한 동일 사이트 경로만 전달합니다. */
  redirectTo?: string;
}
