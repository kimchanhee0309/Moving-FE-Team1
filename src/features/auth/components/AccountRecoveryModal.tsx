"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { ApiError } from "@/common/api/error";
import { useApiErrorMessage } from "@/common/api/useApiErrorMessage";
import type { UserRole } from "@/common/auth/types";
import { Button } from "@/common/components/button";
import { Input } from "@/common/components/Input";
import { getEmailError } from "@/common/validation/email";
import { getNameError } from "@/common/validation/name";
import { getNewPasswordError } from "@/common/validation/password";
import { useValidationMessage } from "@/common/validation/useValidationMessage";
import { useModal } from "@/providers/ModalProvider";

import {
  confirmPasswordReset,
  requestPasswordResetCode,
  verifyPasswordResetCode,
} from "../auth.api";
import type { RecoveryQuestion } from "../auth.types";

interface ForgotPasswordModalProps {
  initialRole?: UserRole;
  onClose: () => void;
}
const FIELD_CLASS = "max-w-none [&>div]:h-[54px]!";

type RecoveryTranslator = ReturnType<typeof useTranslations<"Recovery">>;

function formatExpiryDuration(totalSeconds: number, t: RecoveryTranslator) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return t("seconds", { count: seconds });
  if (seconds === 0) return t("minutes", { count: minutes });
  return t("minutesSeconds", { minutes, seconds });
}

/**
 * 로그인 화면의 비밀번호 찾기 모달입니다.
 * 계정 정보 입력 → 이메일 인증코드 확인 → (복구 질문 등록 계정만) 답변 확인과 새 비밀번호 설정 순서로 진행합니다.
 * 로그인 ID가 이메일이므로 별도 아이디 찾기 단계는 두지 않습니다. SNS 가입 계정은 인증코드 요청 단계에서 안내합니다.
 */
export function ForgotPasswordModal({ initialRole = "CUSTOMER", onClose }: ForgotPasswordModalProps) {
  const t = useTranslations("Recovery");
  const apiErrorMessage = useApiErrorMessage();
  const auth = useTranslations("Auth");
  const translateValidation = useValidationMessage();
  const { setModalDismissible } = useModal();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [codeExpiresInSeconds, setCodeExpiresInSeconds] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [resetToken, setResetToken] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState<RecoveryQuestion | null>(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  // 답변 형식·불일치 오류는 폼 공통 알림 대신 답변 Input의 error로 연결해 aria-invalid·aria-describedby가 해당 필드를 가리키게 합니다.
  const [recoveryAnswerError, setRecoveryAnswerError] = useState("");
  const recoveryAnswerRef = useRef<HTMLInputElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setModalDismissible(!isPending);
    return () => setModalDismissible(true);
  }, [isPending, setModalDismissible]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  function resetRecoveryStep() {
    setChallengeId("");
    setCode("");
    setCodeExpiresInSeconds(0);
    setResendSeconds(0);
    setResetToken("");
    setRecoveryQuestion(null);
    setRecoveryAnswer("");
    setRecoveryAnswerError("");
    setNewPassword("");
    setPasswordConfirm("");
    setIsComplete(false);
    setError("");
  }

  async function sendCode() {
    const response = await requestPasswordResetCode({ name, email, role });
    if (response.delivery === "SOCIAL") {
      setError(t("socialAccount"));
      return;
    }
    if (
      response.delivery !== "EMAIL"
      || !response.challengeId
      || response.expiresInSeconds === null
    ) {
      setError(t("emailNotFound"));
      return;
    }
    setChallengeId(response.challengeId);
    setCode("");
    setCodeExpiresInSeconds(response.expiresInSeconds);
    setResendSeconds(response.resendAfterSeconds ?? 60);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!challengeId) {
      const validationError = getNameError(name) ?? getEmailError(email);
      if (validationError) return setError(translateValidation(validationError) ?? validationError);
    } else if (!/^\d{6}$/.test(code)) {
      return setError(t("codeRequired"));
    }

    setIsPending(true);
    try {
      if (!challengeId) await sendCode();
      else {
        const verification = await verifyPasswordResetCode(challengeId, code);
        setRecoveryQuestion(verification.recoveryQuestion);
        setResetToken(verification.resetToken);
      }
    } catch (caught) {
      setError(apiErrorMessage(caught, t("requestError")));
    } finally {
      setIsPending(false);
    }
  }

  async function handleResend() {
    if (isPending || resendSeconds > 0) return;
    setError("");
    setIsPending(true);
    try { await sendCode(); }
    catch (caught) { setError(apiErrorMessage(caught, t("resendError"))); }
    finally { setIsPending(false); }
  }

  /**
   * 답변 필드 오류를 표시합니다. 제출 전 형식 오류는 필드가 활성 상태이므로 바로 focus를 옮깁니다.
   * 서버 응답 오류는 aria-invalid·aria-describedby로만 연결합니다. 요청 종료 시 ModalProvider가 focus를 모달 첫 요소로 다시 맞추기 때문입니다.
   */
  function showRecoveryAnswerError(message: string, shouldFocus = false) {
    setRecoveryAnswerError(message);
    if (shouldFocus) recoveryAnswerRef.current?.focus();
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setRecoveryAnswerError("");
    const validationError = getNewPasswordError(newPassword)
      ?? (newPassword !== passwordConfirm ? "비밀번호가 일치하지 않습니다." : undefined);
    if (validationError) return setError(translateValidation(validationError) ?? validationError);
    // 서버 validator와 같은 NFKC·trim 기준으로 길이를 확인합니다.
    const normalizedAnswerLength = recoveryAnswer.normalize("NFKC").trim().length;
    if (recoveryQuestion && (normalizedAnswerLength < 2 || normalizedAnswerLength > 100)) return showRecoveryAnswerError(t("recoveryAnswerInvalid"), true);

    setIsPending(true);
    try {
      await confirmPasswordReset(resetToken, newPassword, recoveryQuestion ? recoveryAnswer : undefined);
      setIsComplete(true);
    } catch (caught) {
      let recoveryError: "recoveryAnswerWrong" | "recoveryAnswerAttemptsExceeded" | "recoveryAnswerInvalid" | null = null;
      if (caught instanceof ApiError) {
        if (caught.code === "RECOVERY_ANSWER_INVALID") recoveryError = "recoveryAnswerWrong";
        if (caught.code === "RECOVERY_ANSWER_ATTEMPTS_EXCEEDED") recoveryError = "recoveryAnswerAttemptsExceeded";
        if (caught.code === "RECOVERY_ANSWER_REQUIRED") recoveryError = "recoveryAnswerInvalid";
      }
      // 답변 형식·불일치는 답변 필드 오류로 표시합니다.
      if (recoveryError === "recoveryAnswerWrong" || recoveryError === "recoveryAnswerInvalid") {
        return showRecoveryAnswerError(t(recoveryError));
      }
      // 이 challenge의 답변 기회가 끝났으므로 코드 입력 단계로 돌려 같은 계정으로 새 코드를 바로 요청할 수 있게 합니다.
      if (recoveryError === "recoveryAnswerAttemptsExceeded") {
        setResetToken("");
        setRecoveryQuestion(null);
        setRecoveryAnswer("");
        setRecoveryAnswerError("");
        setCode("");
      }
      // 복구 답변 오류는 화면 문맥에 맞춘 전용 문구를, 그 외 오류는 locale별 공통 오류 문구를 사용합니다.
      setError(recoveryError ? t(recoveryError) : apiErrorMessage(caught, t("resetError")));
    } finally {
      setIsPending(false);
    }
  }

  const title = t(isComplete ? "resetDoneTitle" : resetToken ? "newPasswordTitle" : challengeId ? "checkCodeTitle" : "forgotTitle");

  return (
    <section className="relative box-border w-[calc(100vw-48px)] max-w-[560px] px-6 py-8 min-[744px]:px-10 min-[744px]:py-10" aria-labelledby="account-recovery-title">
      <button type="button" aria-label={t("close")} className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full text-2xl leading-none text-[var(--gray-500)] transition-colors hover:bg-[var(--gray-100)] hover:text-[var(--black-300)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:opacity-40" disabled={isPending} onClick={onClose}>×</button>

      <header className="px-8 text-center">
        <h2 id="account-recovery-title" className="text-2xl-bold text-[var(--black-400)]">{title}</h2>
        {!resetToken && !isComplete ? <p className="text-sm-regular mt-3 text-[var(--gray-500)]">{challengeId ? t("codeHint", { email, duration: formatExpiryDuration(codeExpiresInSeconds, t) }) : t("resetHint")}</p> : null}
      </header>

      {isComplete ? (
        <div className="mt-8 flex flex-col gap-5">
          <p role="status" className="text-base text-center leading-7 text-[var(--black-300)]">{t("complete")}</p>
          <Button type="button" size="md" fullWidth onClick={onClose}>{t("backToLogin")}</Button>
        </div>
      ) : resetToken ? (
        <form className="mt-8 flex flex-col gap-5" noValidate aria-busy={isPending} onSubmit={handlePasswordReset}>
          <p className="text-sm text-[var(--gray-500)]">{t("passwordHint")}</p>
          {recoveryQuestion ? <Input ref={recoveryAnswerRef} data-autofocus required error={recoveryAnswerError || undefined} name="recoveryAnswer" label={t("recoveryQuestion", { question: t(`recoveryQuestions.${recoveryQuestion}`) })} type="password" autoComplete="off" value={recoveryAnswer} disabled={isPending} containerClassName={FIELD_CLASS} placeholder={t("recoveryAnswerPlaceholder")} onChange={(event) => { setRecoveryAnswer(event.currentTarget.value); setRecoveryAnswerError(""); setError(""); }} /> : null}
          <Input data-autofocus={recoveryQuestion ? undefined : true} name="newPassword" label={t("newPassword")} type="password" autoComplete="new-password" value={newPassword} disabled={isPending} containerClassName={FIELD_CLASS} placeholder={t("newPasswordPlaceholder")} onChange={(event) => { setNewPassword(event.currentTarget.value); setError(""); }} />
          <Input name="passwordConfirm" label={t("confirmPassword")} type="password" autoComplete="new-password" value={passwordConfirm} disabled={isPending} containerClassName={FIELD_CLASS} placeholder={t("confirmPasswordPlaceholder")} onChange={(event) => { setPasswordConfirm(event.currentTarget.value); setError(""); }} />
          {error && <p role="alert" className="text-sm-medium rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">{error}</p>}
          <Button type="submit" size="md" fullWidth disabled={isPending} isLoading={isPending}>{t("resetSubmit")}</Button>
          <button type="button" className="text-sm text-[var(--gray-500)] underline underline-offset-4" disabled={isPending} onClick={resetRecoveryStep}>{t("reenter")}</button>
        </form>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-2" aria-label={t("roleLabel")}>
            {(["CUSTOMER", "MOVER"] as const).map((value) => <Button key={value} type="button" size="sm" aria-pressed={role === value} variant={role === value ? "solid" : "outlined"} fullWidth disabled={isPending || Boolean(challengeId)} onClick={() => { setRole(value); resetRecoveryStep(); }}>{t(value === "CUSTOMER" ? "customer" : "mover")}</Button>)}
          </div>

          <form className="mt-6 flex flex-col gap-5" noValidate aria-busy={isPending} onSubmit={handleSubmit}>
            <Input name="name" label={auth("name")} autoComplete="name" value={name} disabled={isPending || Boolean(challengeId)} containerClassName={FIELD_CLASS} placeholder={t("namePlaceholder")} onChange={(event) => { setName(event.currentTarget.value); setError(""); }} />
            <Input name="email" label={auth("email")} type="email" autoComplete="email" value={email} disabled={isPending || Boolean(challengeId)} containerClassName={FIELD_CLASS} placeholder={t("emailPlaceholder")} onChange={(event) => { setEmail(event.currentTarget.value); setError(""); }} />
            {challengeId ? (
              <div className="rounded-2xl bg-[var(--primary-100)] p-4">
                <Input data-autofocus name="code" label={t("code")} autoComplete="one-time-code" inputMode="numeric" maxLength={6} value={code} disabled={isPending} containerClassName={FIELD_CLASS} placeholder={t("codePlaceholder")} onChange={(event) => { setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} />
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[var(--gray-500)]">
                  <button type="button" className="underline underline-offset-4 disabled:no-underline disabled:opacity-60" disabled={isPending || resendSeconds > 0} onClick={() => void handleResend()}>{resendSeconds > 0 ? t("resendIn", { count: resendSeconds }) : t("resend")}</button>
                  <button type="button" className="underline underline-offset-4" disabled={isPending} onClick={resetRecoveryStep}>{t("editAccount")}</button>
                </div>
              </div>
            ) : null}
            {error && <p role="alert" className="text-sm-medium rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">{error}</p>}
            <Button type="submit" size="md" fullWidth disabled={isPending} isLoading={isPending}>{t(challengeId ? "checkCode" : "sendCode")}</Button>
          </form>
        </>
      )}
    </section>
  );
}
