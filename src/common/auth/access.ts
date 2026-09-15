import type { AuthAccess, AuthStatus, AuthUser, UserRole } from "./types";

/** 화면 진입 안내만 판정합니다. 실제 데이터 권한은 백엔드가 검증합니다. */
export function getAuthAccess(
  user: AuthUser | null,
  status: AuthStatus,
  role: UserRole,
  allowIncompleteProfile = false,
): AuthAccess {
  if (status === "loading") return "loading";
  if (status === "auth-error" || status === "network-error" || status === "error") return "unavailable";
  if (!user) return "guest";
  if (user.role !== role) return "role-mismatch";
  if (!user.profileCompleted && !allowIncompleteProfile) return "profile-required";
  return "allowed";
}
