export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/** 프로필 폼의 검증값과 API 전송값이 같도록 숫자만 남깁니다. */
export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}
