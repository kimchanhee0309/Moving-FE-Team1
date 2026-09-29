"use client";

import { useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/common/api/error";
import type { UserRole } from "@/common/auth/types";
import { Button } from "@/common/components/button";
import { Input } from "@/common/components/Input";
import { useModal } from "@/providers/ModalProvider";
import { getEmailError } from "@/common/validation/email";
import { getNameError } from "@/common/validation/name";
import { getNewPasswordError } from "@/common/validation/password";

import {
  confirmPasswordReset,
  fetchRecoveryQuestion,
  findAccount,
  verifyRecoveryAnswer,
  type AccountLookupResult,
} from "../auth.api";
import type { RecoveryMode, RecoveryQuestion } from "../auth.types";

interface AccountRecoveryModalProps {
  mode: RecoveryMode;
  initialRole?: UserRole;
  onClose: () => void;
}

type RecoveryModalEntryProps = Omit<AccountRecoveryModalProps, "mode">;

const FIELD_CLASS = "max-w-none [&>div]:h-[54px]!";
const QUESTION_LABELS: Record<RecoveryQuestion, string> = {
  CHILDHOOD_NICKNAME: "어린 시절 별명은 무엇인가요?",
  MEMORABLE_PLACE: "가장 기억에 남는 장소는 어디인가요?",
  PERSONAL_PHRASE: "나만 기억하는 문구는 무엇인가요?",
};

function AccountRecoveryModal({
  mode,
  initialRole = "CUSTOMER",
  onClose,
}: AccountRecoveryModalProps) {
  const { setModalDismissible } = useModal();
  const [role, setRole] = useState<UserRole>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState<RecoveryQuestion | null>(null);
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
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

  function resetRecoveryStep() {
    setQuestion(null);
    setRecoveryAnswer("");
    setResetToken("");
    setNewPassword("");
    setPasswordConfirm("");
    setIsComplete(false);
    setError("");
    setResult(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);
    const validationError = getNameError(name) ?? getEmailError(email);
    if (validationError) return setError(validationError);

    setIsPending(true);
    try {
      if (mode === "find-account") {
        setResult(await findAccount({ name, email, role }));
      } else if (!question) {
        const response = await fetchRecoveryQuestion({ name, email, role });
        if (response.loginMethod === "SOCIAL") {
          setError("SNS로 가입한 계정입니다. 가입한 SNS로 로그인해 주세요.");
        } else if (!response.available || !response.question) {
          setError("입력한 계정을 찾지 못했거나 복구 질문이 등록되지 않은 계정입니다.");
        } else {
          setQuestion(response.question);
        }
      } else {
        if (recoveryAnswer.trim().length < 2) {
          setError("복구 답변을 2자 이상 입력해 주세요.");
          return;
        }
        setResetToken(await verifyRecoveryAnswer({
          name,
          email,
          role,
          recoveryAnswer: recoveryAnswer.trim(),
        }));
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "요청을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsPending(false);
    }
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

  const title = isComplete
    ? "비밀번호 변경 완료"
    : resetToken
      ? "새 비밀번호 설정"
      : mode === "find-account"
        ? "아이디 찾기"
        : "비밀번호 찾기";

  return (
    <section className="relative box-border w-[calc(100vw-48px)] max-w-[560px] px-6 py-8 min-[744px]:px-10 min-[744px]:py-10" aria-labelledby="account-recovery-title">
      <button
        type="button"
        aria-label="계정 찾기 닫기"
        className="absolute top-5 right-5 flex size-10 items-center justify-center rounded-full text-2xl leading-none text-[var(--gray-500)] transition-colors hover:bg-[var(--gray-100)] hover:text-[var(--black-300)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={isPending}
        onClick={onClose}
      >
        ×
      </button>

      <header className="px-8 text-center">
        <h2 id="account-recovery-title" className="text-2xl-bold text-[var(--black-400)]">{title}</h2>
        {!resetToken && !isComplete ? (
          <p className="text-sm-regular mt-3 text-[var(--gray-500)]">
            {mode === "find-account"
              ? "가입할 때 입력한 이름과 이메일을 확인해 주세요."
              : "가입할 때 등록한 복구 질문을 확인한 뒤 새 비밀번호를 설정해요."}
          </p>
        ) : null}
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
            {(["CUSTOMER", "MOVER"] as const).map((value) => (
              <Button key={value} type="button" size="sm" aria-pressed={role === value} variant={role === value ? "solid" : "outlined"} fullWidth disabled={isPending || Boolean(question)} onClick={() => { setRole(value); resetRecoveryStep(); }}>
                {value === "CUSTOMER" ? "일반 유저" : "기사님"}
              </Button>
            ))}
          </div>

          <form className="mt-6 flex flex-col gap-5" noValidate aria-busy={isPending} onSubmit={handleSubmit}>
            <Input name="name" label="이름" autoComplete="name" value={name} disabled={isPending || Boolean(question)} containerClassName={FIELD_CLASS} placeholder="가입할 때 입력한 이름" onChange={(event) => { setName(event.currentTarget.value); setError(""); setResult(null); }} />
            <Input name="email" label="이메일" type="email" autoComplete="email" value={email} disabled={isPending || Boolean(question)} containerClassName={FIELD_CLASS} placeholder="가입할 때 입력한 이메일" onChange={(event) => { setEmail(event.currentTarget.value); setError(""); setResult(null); }} />
            {mode === "forgot-password" && question ? (
              <div className="rounded-2xl bg-[var(--primary-100)] p-4">
                <p className="text-sm-semibold text-[var(--black-300)]">{QUESTION_LABELS[question]}</p>
                <Input name="recoveryAnswer" label="복구 답변" autoComplete="off" value={recoveryAnswer} disabled={isPending} containerClassName={`${FIELD_CLASS} mt-4`} placeholder="가입할 때 등록한 답변" onChange={(event) => { setRecoveryAnswer(event.currentTarget.value); setError(""); }} />
                <button type="button" className="mt-3 text-sm text-[var(--gray-500)] underline underline-offset-4" disabled={isPending} onClick={resetRecoveryStep}>계정 정보 다시 입력</button>
              </div>
            ) : null}
            {error && <p role="alert" className="text-sm-medium rounded-xl bg-[var(--secondary-red-100)] px-4 py-3 text-[var(--secondary-red-200)]">{error}</p>}
            {result && <p role="status" className="text-sm-medium rounded-xl bg-[var(--primary-100)] px-4 py-3 text-[var(--black-300)]">{result.found ? `${result.loginMethod === "SOCIAL" ? "SNS" : "이메일"} 계정의 로그인 아이디는 ${result.loginId}입니다.` : "입력한 정보와 일치하는 계정을 찾지 못했습니다."}</p>}
            <Button type="submit" size="md" fullWidth disabled={isPending} isLoading={isPending}>{mode === "find-account" ? "아이디 확인" : question ? "복구 답변 확인" : "복구 질문 확인"}</Button>
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
