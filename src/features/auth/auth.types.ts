import type { UserRole } from "@/common/auth/types";

export type AuthMode = "login" | "signup";
export type RecoveryMode = "find-account" | "forgot-password";
export type SocialProvider = "google" | "kakao" | "naver";
export type RecoveryQuestion = "CHILDHOOD_NICKNAME" | "MEMORABLE_PLACE" | "PERSONAL_PHRASE";

/** 백엔드 publicUser DTO. 토큰은 HttpOnly 쿠키에만 있고 이 모델에는 포함되지 않습니다. */
export type { AuthUser } from "@/common/auth/types";

/** 화면 입력 모델입니다. auth.api에서 요청 DTO로 매핑하며 확인 비밀번호는 전송하지 않습니다. */
export interface AuthFormValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirm: string;
  recoveryQuestion: RecoveryQuestion | "";
  recoveryAnswer: string;
}
export type AuthField = keyof AuthFormValues;
export type AuthFormErrors = Partial<Record<AuthField, string>>;

export interface AuthScreenProps {
  role: UserRole;
  mode: AuthMode;
  /** 서버에서 검증한 동일 사이트 경로만 전달합니다. */
  redirectTo?: string;
  /** 기존 복구 주소로 진입했을 때 로그인 화면 위에서 자동으로 열 복구 모달입니다. */
  initialRecoveryMode?: RecoveryMode;
}
