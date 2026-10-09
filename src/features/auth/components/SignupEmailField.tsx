"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent } from "react";

import { ApiError } from "@/common/api/error";
import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import { Button } from "@/common/components/button";
import { Input } from "@/common/components/Input";

import type { SignupEmailVerification } from "../hooks/useSignupEmailVerification";

interface SignupEmailFieldProps {
  /** AuthForm이 소유하는 이메일 입력값입니다. */
  value: string;
  /** 이미 번역된 이메일 검증·서버 오류입니다. 표시 시점(touched)은 AuthForm이 정합니다. */
  error?: string;
  /** 이메일 형식이 올바를 때만 인증코드를 요청할 수 있습니다. */
  canRequestCode: boolean;
  /** 가입 요청 중에는 입력과 인증 조작을 모두 잠급니다. */
  disabled: boolean;
  /** 인증 진행 상태와 명령입니다. 가입 요청에 토큰을 넣는 AuthForm이 hook을 소유합니다. */
  verification: SignupEmailVerification;
  /** AuthForm의 다른 입력과 같은 label·입력 박스·오류 행 배치를 쓰기 위한 클래스입니다. */
  fieldClassName: string;
  inputClassName: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

// 입력 박스(54px)와 같은 행에 버튼을 두기 위해 AuthForm label 높이만큼 내립니다.
// 모바일: text-sm leading-6(24px) + mb-2(8px) = 32px, 744px 이상: text-xl leading-8(32px) + mb-4(16px) = 48px.
// self-start는 버튼이 label·오류 행까지 포함한 grid 행 전체 높이로 늘어나지 않게 합니다.
// !는 공통 Button의 고정 너비(327px)·글자 크기보다 이 화면의 좁은 열 배치를 우선합니다.
const ACTION_BUTTON_CLASS = "mt-8 self-start w-auto! min-h-[54px]! whitespace-nowrap rounded-2xl! px-3! text-sm! min-[744px]:mt-12 min-[744px]:px-5! min-[744px]:text-base!";
// 프로필 수정의 읽기 전용 이메일과 같은 표현입니다. 입력 가능한 칸과 구분되도록 배경을 회색으로 두고 focus 테두리도 강조색 대신 회색을 씁니다.
const LOCKED_FIELD_CLASS = "[&>div]:bg-[var(--gray-100)]! [&>div]:hover:border-[var(--line-200)]! [&>div]:focus-within:border-[var(--gray-300)]!";
const TEXT_BUTTON_CLASS = "cursor-pointer rounded-sm text-sm text-[var(--gray-500)] underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:no-underline disabled:opacity-60";

/**
 * 회원가입 이메일 칸과 이메일 인증(인증코드 받기 → 코드 확인 → 인증 완료)을 한 묶음으로 보여 줍니다.
 * - 코드를 보낸 뒤와 인증 완료 뒤에는 이메일을 잠그고, "이메일 다시 입력"으로 잠금을 풀면 인증을 처음부터 다시 진행합니다.
 * - 코드 입력값·오류 문구·focus 이동만 소유하며, 인증 상태와 API 호출은 useSignupEmailVerification에 위임합니다.
 * - 가입 요청과 가입 버튼 활성화는 AuthForm 책임입니다.
 */
export function SignupEmailField({ value, error, canRequestCode, disabled, verification, fieldClassName, inputClassName, onChange, onBlur }: SignupEmailFieldProps) {
  const t = useTranslations("Auth");
  const apiErrorMessage = useApiErrorMessage();
  const emailRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [sendError, setSendError] = useState("");
  const [codeError, setCodeError] = useState("");
  const { status, resendSeconds, isSending, isVerifying } = verification;
  const isLocked = status !== "idle";
  const isBusy = disabled || isSending || isVerifying;

  function toErrorMessage(caught: unknown, fallbackMessage: string) {
    // 가입 폼의 중복 이메일 안내와 같은 문구를 써서 로그인으로 유도합니다.
    if (caught instanceof ApiError && caught.code === "EMAIL_ALREADY_EXISTS") return t("emailExists");
    if (caught instanceof TypeError) return t("networkError");
    return apiErrorMessage(caught, fallbackMessage);
  }

  async function handleSendCode() {
    if (isBusy || !canRequestCode) return;
    setSendError("");
    setCodeError("");
    try {
      await verification.sendCode(value);
      setCode("");
    } catch (caught) {
      const message = toErrorMessage(caught, t("emailCodeSendFailed"));
      // 첫 요청 실패는 이메일 칸에, 다시 받기 실패는 코드 입력 영역에 표시해 오류가 조작한 위치에 나타나게 합니다.
      if (isLocked) setCodeError(message);
      else setSendError(message);
    }
  }

  async function handleVerifyCode() {
    if (isBusy) return;
    if (!/^\d{6}$/.test(code)) {
      setCodeError(t("emailCodeRequired"));
      return;
    }
    setCodeError("");
    try {
      await verification.verifyCode(value, code);
      setCode("");
      // 코드 입력 영역이 사라지면서 focus를 잃지 않도록 인증 완료 안내가 연결된 이메일 칸으로 옮깁니다.
      emailRef.current?.focus();
    } catch (caught) {
      setCodeError(toErrorMessage(caught, t("emailCodeVerifyFailed")));
    }
  }

  function handleEditEmail() {
    if (isBusy) return;
    verification.reset();
    setCode("");
    setSendError("");
    setCodeError("");
    emailRef.current?.focus();
  }

  function handleCodeKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // 코드 칸은 가입 form 안에 있으므로 Enter가 가입 제출이 아니라 코드 확인으로 동작하게 합니다.
    if (event.key !== "Enter") return;
    event.preventDefault();
    void handleVerifyCode();
  }

  return (
    <div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
        {/* 잠긴 이메일은 disabled 대신 readOnly로 두어 키보드 focus와 보조 기술 읽기를 유지합니다. */}
        <Input
          ref={emailRef}
          id="auth-email"
          name="email"
          label={t("email")}
          aria-required="true"
          type="email"
          autoComplete="email"
          inputMode="email"
          inputSize="md"
          containerClassName={`${fieldClassName} ${isLocked ? LOCKED_FIELD_CLASS : ""}`}
          className={`${inputClassName} ${isLocked ? "cursor-default text-[var(--gray-400)]!" : ""}`}
          value={value}
          disabled={disabled}
          readOnly={isLocked || isSending}
          aria-readonly={isLocked || undefined}
          placeholder={t("emailPlaceholder")}
          error={sendError || error}
          helperText={status === "verified" ? t("emailVerified") : undefined}
          onBlur={onBlur}
          onChange={(event) => { setSendError(""); onChange(event.currentTarget.value); }}
        />
        {isLocked ? (
          <Button type="button" variant="outlined" className={ACTION_BUTTON_CLASS} disabled={isBusy} onClick={handleEditEmail}>
            {t("emailEdit")}
          </Button>
        ) : (
          <Button type="button" variant="outlined" className={ACTION_BUTTON_CLASS} disabled={isBusy || !canRequestCode} isLoading={isSending} onClick={() => void handleSendCode()}>
            {t("emailCodeSend")}
          </Button>
        )}
      </div>

      {status === "codeSent" ? (
        <div className="mb-3 rounded-2xl bg-[var(--primary-100)] p-4 min-[744px]:mb-6" aria-busy={isSending || isVerifying}>
          <p role="status" className="text-sm leading-6 text-[var(--black-300)] [overflow-wrap:anywhere]">
            {t("emailCodeHint", { email: value.trim(), minutes: Math.max(1, Math.round(verification.expiresInSeconds / 60)) })}
          </p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2">
            {/* 코드를 받은 직후 바로 입력할 수 있도록 새로 나타난 코드 칸으로 focus를 옮깁니다. */}
            <Input
              autoFocus
              id="auth-email-code"
              name="emailCode"
              label={t("emailCodeLabel")}
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              inputSize="md"
              containerClassName="max-w-none! [&>div]:h-[54px]!"
              className="text-base! min-[744px]:text-lg!"
              value={code}
              disabled={disabled}
              readOnly={isVerifying}
              placeholder={t("emailCodePlaceholder")}
              aria-invalid={Boolean(codeError) || undefined}
              aria-describedby={codeError ? "auth-email-code-error" : undefined}
              onKeyDown={handleCodeKeyDown}
              onChange={(event) => { setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, 6)); setCodeError(""); }}
            />
            <Button type="button" className="w-auto! min-h-[54px]! whitespace-nowrap rounded-2xl! px-4! text-sm! min-[744px]:px-6! min-[744px]:text-base!" disabled={isBusy} isLoading={isVerifying} onClick={() => void handleVerifyCode()}>
              {t("emailCodeConfirm")}
            </Button>
          </div>
          {codeError ? <p id="auth-email-code-error" role="alert" className="mt-2 text-xs leading-5 text-[var(--primary-400)]">{codeError}</p> : null}
          <button type="button" className={`mt-3 ${TEXT_BUTTON_CLASS}`} disabled={isBusy || resendSeconds > 0} onClick={() => void handleSendCode()}>
            {resendSeconds > 0 ? t("emailCodeResendIn", { count: resendSeconds }) : t("emailCodeResend")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
