"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import { CURRENT_PASSWORD_MISMATCH_MESSAGE } from "@/common/api/get-error-message";

import { PHONE_ERROR_MESSAGE } from "./contact";
import { EMAIL_ERROR_MESSAGE } from "./email";
import { NAME_ERROR_MESSAGE } from "./name";

// validator는 서버 계약·테스트와 같은 한국어 원문을 반환하므로 표시 직전에만 번역 키로 바꿉니다.
const VALIDATION_KEYS = {
  "비밀번호를 입력해 주세요.": "passwordRequired",
  "올바른 휴대전화 번호를 입력해 주세요.": "phoneInvalid",
  "비밀번호가 일치하지 않습니다.": "passwordMismatch",
  "비밀번호는 8자 이상 입력해 주세요.": "passwordShort",
  "비밀번호가 너무 깁니다. 영문 기준 72자 이내로 입력해 주세요.": "passwordLong",
  "영문, 숫자, 특수문자를 각각 포함해 주세요.": "passwordComposition",
  [EMAIL_ERROR_MESSAGE]: "emailInvalid",
  [NAME_ERROR_MESSAGE]: "nameInvalid",
  [PHONE_ERROR_MESSAGE]: "phoneKoreaInvalid",
  "현재 비밀번호는 8자 이상 입력해 주세요.": "currentPasswordShort",
  "현재 비밀번호가 너무 깁니다. 더 짧게 입력해 주세요.": "currentPasswordLong",
  [CURRENT_PASSWORD_MISMATCH_MESSAGE]: "currentPasswordMismatch",
} as const satisfies Record<string, string>;

type ValidationSource = keyof typeof VALIDATION_KEYS;

function isKnownValidationMessage(message: string): message is ValidationSource {
  return Object.hasOwn(VALIDATION_KEYS, message);
}

/**
 * 공통 validator의 한국어 오류를 현재 locale 문구로 바꿉니다.
 * 매핑에 없는 문구(서버 detail 등)는 원문 그대로 반환합니다.
 */
export function useValidationMessage() {
  const t = useTranslations("AuthValidation");

  return useCallback(
    (message: string | undefined) => (message && isKnownValidationMessage(message) ? t(VALIDATION_KEYS[message]) : message),
    [t],
  );
}
