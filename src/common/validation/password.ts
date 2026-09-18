const PASSWORD_LETTER_PATTERN = /[A-Za-z]/;
const PASSWORD_NUMBER_PATTERN = /\d/;
const PASSWORD_SPECIAL_PATTERN = /[^A-Za-z\d\s]/;
const MIN_PASSWORD_CHARACTERS = 8;
const MAX_PASSWORD_BYTES = 72;

function getPasswordByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** 회원가입·비밀번호 변경에서 사용자에게 이해하기 쉬운 순서로 한 가지 오류만 반환합니다. */
export function getNewPasswordError(value: string): string | undefined {
  if (Array.from(value).length < MIN_PASSWORD_CHARACTERS) {
    return "비밀번호는 8자 이상 입력해 주세요.";
  }

  if (getPasswordByteLength(value) > MAX_PASSWORD_BYTES) {
    return "비밀번호가 너무 깁니다. 영문 기준 72자 이내로 입력해 주세요.";
  }

  if (
    !PASSWORD_LETTER_PATTERN.test(value) ||
    !PASSWORD_NUMBER_PATTERN.test(value) ||
    !PASSWORD_SPECIAL_PATTERN.test(value)
  ) {
    return "영문, 숫자, 특수문자를 각각 포함해 주세요.";
  }

  return undefined;
}

/** 기존 계정 비밀번호는 조합 규칙을 다시 강제하지 않고 길이 경계만 확인합니다. */
export function getCurrentPasswordError(value: string): string | undefined {
  if (Array.from(value).length < MIN_PASSWORD_CHARACTERS) {
    return "현재 비밀번호는 8자 이상 입력해 주세요.";
  }

  if (getPasswordByteLength(value) > MAX_PASSWORD_BYTES) {
    return "현재 비밀번호가 너무 깁니다. 더 짧게 입력해 주세요.";
  }

  return undefined;
}
