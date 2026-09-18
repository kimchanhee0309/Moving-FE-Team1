export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** 검증을 통과한 전화번호를 API 전송 형식으로 바꾸기 위해 숫자만 남깁니다. */
export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

const PHONE_FORMAT_PATTERN = /^[\d\s().-]+$/;
const KOREAN_MOBILE_PATTERN = /^(?:010\d{8}|01[16789]\d{7,8})$/;
export const PHONE_ERROR_MESSAGE = "올바른 대한민국 전화번호를 입력해 주세요.";

/**
 * 공백·괄호·하이픈·마침표 형식은 허용하되 문자를 조용히 제거해 정상값으로
 * 오인하지 않습니다. 빈 값 허용 여부는 각 API 계약에 맞춰 호출부가 정합니다.
 */
export function getPhoneError(value: string, required = false): string | undefined {
  const trimmedValue = value.trim();
  if (!trimmedValue) return required ? PHONE_ERROR_MESSAGE : undefined;
  if (!PHONE_FORMAT_PATTERN.test(trimmedValue)) return PHONE_ERROR_MESSAGE;
  return KOREAN_MOBILE_PATTERN.test(normalizePhoneDigits(trimmedValue))
    ? undefined
    : PHONE_ERROR_MESSAGE;
}
