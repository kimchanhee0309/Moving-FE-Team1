import { ApiError } from "./error";

export const CURRENT_PASSWORD_MISMATCH_MESSAGE = "현재 비밀번호가 일치하지 않습니다.";

const CURRENT_PASSWORD_ERROR_CODES = new Set([
  "INVALID_CURRENT_PASSWORD",
  "INCORRECT_CURRENT_PASSWORD",
  "CURRENT_PASSWORD_MISMATCH",
]);

const CURRENT_PASSWORD_MESSAGE_PATTERN =
  /현재\s*비밀번호.*(?:올바르지|일치하지|틀렸|잘못)/;

/**
 * 비밀번호 변경 API가 현재 비밀번호 불일치를 확정한 경우 입력 필드용 오류를 반환합니다.
 * 배포 버전에 따라 code 대신 message/detail만 내려오는 응답도 같은 필드에 연결합니다.
 */
export function getCurrentPasswordMismatchError(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined;

  const isCurrentPasswordCode = CURRENT_PASSWORD_ERROR_CODES.has(error.code);
  const isCurrentPasswordMessage = CURRENT_PASSWORD_MESSAGE_PATTERN.test(error.message);
  const hasCurrentPasswordDetail = error.details.some(
    ({ field, reason }) =>
      field === "currentPassword" && CURRENT_PASSWORD_MESSAGE_PATTERN.test(reason),
  );

  return isCurrentPasswordCode || isCurrentPasswordMessage || hasCurrentPasswordDetail
    ? CURRENT_PASSWORD_MISMATCH_MESSAGE
    : undefined;
}

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
