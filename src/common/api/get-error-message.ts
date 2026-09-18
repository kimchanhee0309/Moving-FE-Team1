import { ApiError } from "./error";

/**
 * API 및 일반 JavaScript 오류를 사용자에게 보여줄 문자열로 반환
 *
 * ApiError라면 백엔드가 내려준 message를 사용하고,
 * 일반 Error라면 해당 오류의 message를 사용
 * 오류 형태를 알 수 없으면 호출부에서 전달한 fallbackMessage를 반환
 */
export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return fallbackMessage;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}
