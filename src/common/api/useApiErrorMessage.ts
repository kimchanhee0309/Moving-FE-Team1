"use client";

import { useLocale, useMessages, useTranslations, type Messages } from "next-intl";
import { useCallback } from "react";

import { ApiError } from "./error";
import { getApiErrorMessage } from "./get-error-message";

type ApiErrorCode = keyof Messages["ApiErrors"];

// 같은 code라도 서버가 상황별로 다른 문장을 보내는 범용 code는 code 번역 대신 화면의 기본 문구를 씁니다.
const GENERIC_CODES = new Set(["BAD_REQUEST", "VALIDATION_ERROR", "INVALID_REQUEST"]);

function isApiErrorCode(messages: Messages["ApiErrors"], code: string): code is ApiErrorCode {
  return Object.hasOwn(messages, code);
}

/**
 * API 오류를 현재 locale의 사용자 문구로 바꿉니다.
 * - ko: 서버가 보낸 한국어 message를 그대로 씁니다(기존 동작 유지).
 * - 그 외 locale: 오류 code의 번역을 쓰고, 모르는 code·범용 code·네트워크 오류는 호출부의 기본 문구를 씁니다.
 * 번역 문구는 messages의 ApiErrors namespace에서 code별로 관리합니다.
 */
export function useApiErrorMessage() {
  const locale = useLocale();
  const t = useTranslations("ApiErrors");
  const apiErrorMessages = useMessages().ApiErrors;

  return useCallback(
    (error: unknown, fallbackMessage: string): string => {
      if (locale === "ko") return getApiErrorMessage(error, fallbackMessage);
      if (error instanceof ApiError && !GENERIC_CODES.has(error.code) && isApiErrorCode(apiErrorMessages, error.code)) {
        return t(error.code);
      }
      return fallbackMessage;
    },
    [apiErrorMessages, locale, t],
  );
}
