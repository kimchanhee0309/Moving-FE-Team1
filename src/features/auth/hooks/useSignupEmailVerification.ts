"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { requestSignupEmailCode, verifySignupEmailCode } from "../auth.api";

/** idle: 코드 요청 전, codeSent: 코드 입력 대기, verified: 인증 완료(이메일 잠금) */
export type SignupEmailVerificationStatus = "idle" | "codeSent" | "verified";

export interface SignupEmailVerification {
  status: SignupEmailVerificationStatus;
  /** 인증 완료 후 가입 요청에 넣을 토큰입니다. 인증 전에는 null입니다. */
  token: string | null;
  /** 서버가 알려 준 인증코드 유효 시간(초)입니다. 코드를 보내기 전에는 0입니다. */
  expiresInSeconds: number;
  /** 다시 받기 버튼을 열 때까지 남은 시간(초)입니다. */
  resendSeconds: number;
  isSending: boolean;
  isVerifying: boolean;
  /** 인증코드를 보내거나 다시 보냅니다. 실패는 그대로 던져 화면이 문구를 정합니다. */
  sendCode: (email: string) => Promise<void>;
  /** 입력한 코드를 확인하고 성공하면 verified로 전환합니다. 실패는 그대로 던집니다. */
  verifyCode: (email: string, code: string) => Promise<void>;
  /** 이메일을 다시 입력하거나 서버가 인증을 거절했을 때 인증 상태를 처음으로 되돌립니다. */
  reset: () => void;
}

/**
 * 회원가입 화면의 이메일 인증 진행 상태(코드 발송 → 코드 확인 → 인증 완료)를 관리합니다.
 * 이메일 입력값과 코드 입력값, 오류 문구, focus 이동은 화면 컴포넌트가 담당합니다.
 * 인증 토큰은 탭을 닫으면 사라지는 메모리 상태로만 두며 localStorage·sessionStorage에 저장하지 않습니다.
 */
export function useSignupEmailVerification(): SignupEmailVerification {
  const [token, setToken] = useState<string | null>(null);
  const [expiresInSeconds, setExpiresInSeconds] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const sendMutation = useMutation({ mutationFn: requestSignupEmailCode });
  const verifyMutation = useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) => verifySignupEmailCode(email, code),
  });

  // 재발송 대기 시간은 서버의 60초 제한과 맞춰 화면에서만 줄여 나갑니다. 실제 제한은 서버가 다시 검증합니다.
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setInterval(() => setResendSeconds((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  // 상태 우선순위: 토큰이 있으면 verified, 코드만 보냈으면 codeSent, 둘 다 없으면 idle입니다.
  const status: SignupEmailVerificationStatus = token ? "verified" : expiresInSeconds > 0 ? "codeSent" : "idle";

  async function sendCode(email: string) {
    const result = await sendMutation.mutateAsync(email);
    // 새 코드를 받으면 서버가 이전 인증을 무효화하므로 화면의 토큰도 함께 비웁니다.
    setToken(null);
    setExpiresInSeconds(result.expiresInSeconds);
    setResendSeconds(result.resendAfterSeconds);
  }

  async function verifyCode(email: string, code: string) {
    const result = await verifyMutation.mutateAsync({ email, code });
    setToken(result.emailVerificationToken);
  }

  function reset() {
    setToken(null);
    setExpiresInSeconds(0);
    setResendSeconds(0);
  }

  return {
    status,
    token,
    expiresInSeconds,
    resendSeconds,
    isSending: sendMutation.isPending,
    isVerifying: verifyMutation.isPending,
    sendCode,
    verifyCode,
    reset,
  };
}
