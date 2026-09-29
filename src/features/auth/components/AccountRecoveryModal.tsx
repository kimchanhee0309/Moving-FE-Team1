"use client";

import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/common/api/error";
import type { UserRole } from "@/common/auth/types";
import { Button } from "@/common/components/button";
import { Input } from "@/common/components/Input";
import { getEmailError } from "@/common/validation/email";
import { getNameError } from "@/common/validation/name";
import { getNewPasswordError } from "@/common/validation/password";
import { useModal } from "@/providers/ModalProvider";

import {
  confirmPasswordReset,
  findAccount,
  requestPasswordResetCode,
  verifyPasswordResetCode,
  type AccountLookupResult,
} from "../auth.api";
import type { RecoveryMode } from "../auth.types";

interface AccountRecoveryModalProps {
  mode: RecoveryMode;
  initialRole?: UserRole;
  onClose: () => void;
}

type RecoveryModalEntryProps = Omit<AccountRecoveryModalProps, "mode">;
const FIELD_CLASS = "max-w-none [&>div]:h-[54px]!";

function AccountRecoveryModal({ mode, initialRole = "CUSTOMER", onClose }: AccountRecoveryModalProps) {
  const { setModalDismissible } = useModal();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AccountLookupResult | null>(null);
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
    setResendSeconds(0);
    setResetToken("");
    setNewPassword("");
    setPasswordConfirm("");
    setIsComplete(false);
    setError("");
    setResult(null);
  }

  async function sendCode() {
    const response = await requestPasswordResetCode({ name, email, role });
    if (response.delivery === "SOCIAL") {
      setError("SNS 계정으로 가입했습니다. 비밀번호는 해당 SNS에서 관리하므로, 가입한 SNS의 비밀번호 찾기에서 재설정한 뒤 다시 로그인해 주세요.");
      return;
    }
    if (response.delivery !== "EMAIL" || !response.challengeId) {
      setError("입력한 정보와 일치하는 이메일 계정을 찾지 못했습니다.");
      return;
    }
    setChallengeId(response.challengeId);
    setCode("");
    setResendSeconds(response.resendAfterSeconds ?? 60);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!challengeId) {
      const validationError = getNameError(name) ?? getEmailError(email);
      if (validationError) return setError(validationError);
    } else if (!/^\d{6}$/.test(code)) {
      return setError("인증코드 6자리를 입력해 주세요.");
    }

    setIsPending(true);
    try {
      if (mode === "find-account") setResult(await findAccount({ name, email, role }));
      else if (!challengeId) await sendCode();
      else setResetToken(await verifyPasswordResetCode(challengeId, code));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleResend() {
    if (isPending || resendSeconds > 0) return;
    setError("");
    setIsPending(true);
    try { await sendCode(); }
    catch (caught) { setError(caught instanceof ApiError ? caught.message : "인증코드를 다시 보내지 못했습니다."); }
    finally { setIsPending(false); }
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const validationError = getNewPasswordError(newPassword)
      ?? (newPassword !== passwordConfirm ? "비밀번호가 일치하지 않습니다." : undefined);
    if (validationError) return setError(validationError);

    setIsPending(true);
    try {
      await confirmPasswordReset(resetToken, newPassword);
      setIsComplete(true);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "비밀번호를 변경하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
  }

  const title = isComplete ? "비밀번호 변경 완료" : resetToken ? "새 비밀번호 설정" : mode === "find-account" ? "아이디 찾기" : challengeId ? "인증코드 확인" : "비밀번호 찾기";

  return (
    <section className="relative box-border w-[calc(100vw-48px)] max-w-[560px] px-6 py-8 min-[744px]:px-10 min-[744px]:py-10" aria-labelledby="account-recovery-title">
      <button type="button" aria-label="계정 찾기 닫기" className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full text-2xl leading-none text-[var(--gray-500)] transition-colors hover:bg-[var(--gray-100)] hover:text-[var(--black-300)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:opacity-40" disabled={isPending} onClick={onClose}>×</button>

      <header className="px-8 text-center">
        <h2 id="account-recovery-title" className="text-2xl-bold text-[var(--black-400)]">{title}</h2>
        {!resetToken && !isComplete ? <p className="text-sm-regular mt-3 text-[var(--gray-500)]">{mode === "find-account" ? "가입할 때 입력한 이름과 이메일을 확인해 주세요." : challengeId ? `${email}로 보낸 6자리 인증코드를 5분 안에 입력해 주세요.` : "가입한 이름과 이메일로 인증코드를 받아 새 비밀번호를 설정해요."}</p> : null}
      </header>

      {isComplete ? (
        <div className="mt-8 flex flex-col gap-5">
          <p role="status" className="text-base text-center leading-7 text-[var(--black-300)]">비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.</p>
          <Button type="button" size="md" fullWidth onClick={onClose}>로그인으로 돌아가기</Button>
        </div>
      ) : resetToken ? (
        <form className="mt-8 flex flex-col gap-5" noValidate aria-busy={isPending} onSubmit={handlePasswordReset}>
          <p className="text-sm text-[var(--gray-500)]">기존 비밀번호는 표시하지 않으며, 새 비밀번호로 안전하게 교체합니다.</p>
          <Input data-autofocus name="newPassword" label="새 비밀번호" type="password" autoComplete="new-password" value={newPassword} disabled={isPending} containerClassName={FIELD_CLASS} placeholder="영문, 숫자, 특수문자 포함 8자 이상" onChange={(event) => { setNewPassword(event.currentTarget.value); setError(""); }} />
          <Input name="passwordConfirm" label="새 비밀번호 확인" type="password" autoComplete="new-password" value={passwordConfirm} disabled={isPending} containerClassName={FIELD_CLASS} placeholder="새 비밀번호를 다시 입력해 주세요" onChange={(event) => { setPasswordConfirm(event.currentTarget.value); setError(""); }} />
          {error && <p role="alert" className="text-sm-medium rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">{error}</p>}
          <Button type="submit" size="md" fullWidth disabled={isPending} isLoading={isPending}>비밀번호 변경</Button>
          <button type="button" className="text-sm text-[var(--gray-500)] underline underline-offset-4" disabled={isPending} onClick={resetRecoveryStep}>계정 정보 다시 입력</button>
        </form>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-2" aria-label="계정 유형 선택">
            {(["CUSTOMER", "MOVER"] as const).map((value) => <Button key={value} type="button" size="sm" aria-pressed={role === value} variant={role === value ? "solid" : "outlined"} fullWidth disabled={isPending || Boolean(challengeId)} onClick={() => { setRole(value); resetRecoveryStep(); }}>{value === "CUSTOMER" ? "일반 유저" : "기사님"}</Button>)}
          </div>

          <form className="mt-6 flex flex-col gap-5" noValidate aria-busy={isPending} onSubmit={handleSubmit}>
            <Input name="name" label="이름" autoComplete="name" value={name} disabled={isPending || Boolean(challengeId)} containerClassName={FIELD_CLASS} placeholder="가입할 때 입력한 이름" onChange={(event) => { setName(event.currentTarget.value); setError(""); setResult(null); }} />
            <Input name="email" label="이메일" type="email" autoComplete="email" value={email} disabled={isPending || Boolean(challengeId)} containerClassName={FIELD_CLASS} placeholder="가입할 때 입력한 이메일" onChange={(event) => { setEmail(event.currentTarget.value); setError(""); setResult(null); }} />
            {mode === "forgot-password" && challengeId ? (
              <div className="rounded-2xl bg-[var(--primary-100)] p-4">
                <Input data-autofocus name="code" label="이메일 인증코드" autoComplete="one-time-code" inputMode="numeric" maxLength={6} value={code} disabled={isPending} containerClassName={FIELD_CLASS} placeholder="6자리 숫자" onChange={(event) => { setCode(event.currentTarget.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} />
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[var(--gray-500)]">
                  <button type="button" className="underline underline-offset-4 disabled:no-underline disabled:opacity-60" disabled={isPending || resendSeconds > 0} onClick={() => void handleResend()}>{resendSeconds > 0 ? `${resendSeconds}초 후 재전송` : "인증코드 다시 보내기"}</button>
                  <button type="button" className="underline underline-offset-4" disabled={isPending} onClick={resetRecoveryStep}>계정 정보 수정</button>
                </div>
              </div>
            ) : null}
            {error && <p role="alert" className="text-sm-medium rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">{error}</p>}
            {result && <p role="status" className="text-sm-medium rounded-xl bg-[var(--primary-100)] px-4 py-3 text-[var(--black-300)]">{result.found ? `${result.loginMethod === "SOCIAL" ? "SNS" : "이메일"} 계정의 로그인 아이디는 ${result.loginId}입니다.` : "입력한 정보와 일치하는 계정을 찾지 못했습니다."}</p>}
            <Button type="submit" size="md" fullWidth disabled={isPending} isLoading={isPending}>{mode === "find-account" ? "아이디 확인" : challengeId ? "인증코드 확인" : "인증코드 보내기"}</Button>
          </form>
        </>
      )}
    </section>
  );
}

/** 로그인 화면의 아이디 찾기 버튼이 여는 독립 모달입니다. */
export function FindAccountModal(props: RecoveryModalEntryProps) {
  return <AccountRecoveryModal {...props} mode="find-account" />;
}

/** 로그인 화면의 비밀번호 찾기 버튼이 여는 독립 모달입니다. */
export function ForgotPasswordModal(props: RecoveryModalEntryProps) {
  return <AccountRecoveryModal {...props} mode="forgot-password" />;
}
