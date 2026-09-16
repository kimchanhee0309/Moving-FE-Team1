import { ApiError } from "@/common/api/error";
import type { AuthUser } from "./types";

/** apiClient가 벗긴 data.user를 실제 공개 DTO로 검증합니다. profileCompleted는 서버 값을 그대로 사용합니다. */
export function readUser(data: unknown): AuthUser {
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

