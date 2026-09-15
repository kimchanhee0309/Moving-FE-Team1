import type { QueryObserverResult, UseMutationResult } from "@tanstack/react-query";
import type { UserRole } from "@/common/constants/domain";
export type { UserRole } from "@/common/constants/domain";

/** 백엔드 공개 DTO 한 곳만 사용합니다. 쿠키와 토큰은 이 모델에 포함되지 않습니다. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  profileCompleted: boolean;
}

export interface AuthSession {
  user: AuthUser | null;
  failure: Error | null;
}

export type AuthStatus = "loading" | "guest" | "authenticated" | "auth-error" | "network-error" | "error";

export type AuthAccess = "loading" | "unavailable" | "guest" | "role-mismatch" | "profile-required" | "allowed";

interface CredentialsInput {
  role: UserRole;
  email: string;
  password: string;
}

export type AuthCredentialsRequest =
  | (CredentialsInput & { mode: "login" })
  | (CredentialsInput & { mode: "signup"; name: string; phone: string });

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  isPending: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  logout: UseMutationResult<null, Error, void>;
  credentials: UseMutationResult<{ user: AuthUser }, Error, AuthCredentialsRequest>;
  refetch: () => Promise<QueryObserverResult<AuthSession, Error>>;
  refetchUser: () => Promise<AuthUser | null>;
  checkAccess: (role: UserRole, allowIncompleteProfile?: boolean) => AuthAccess;
}
