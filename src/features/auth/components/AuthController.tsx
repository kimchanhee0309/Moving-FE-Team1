"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { beginSocialLogin } from "../auth.api";
import type { AuthScreenProps, SocialProvider } from "../auth.types";
import { resolveAuthenticatedPath, safeAuthRedirect } from "../auth.utils";
import { useAuth } from "../hooks/useAuth";
import { AuthForm } from "./AuthForm";

/**
 * 역할별 로그인/회원가입 페이지와 AuthForm 사이의 연동 컨테이너입니다.
 * 이메일 인증은 루트 Provider의 명령을 사용하며 사용자 상태를 이 화면에 따로 저장하지 않습니다.
 * API 성공 후 서버 profileCompleted로 등록/정상 진입 경로를 결정합니다. SNS 시작 pending만 화면에서 관리합니다.
 */
export function AuthController(props: AuthScreenProps) {
  const router = useRouter();
  const { credentials } = useAuth();
  const socialMutation = useMutation({
    mutationFn: (provider: SocialProvider) => beginSocialLogin(
      provider, props.role, safeAuthRedirect(props.redirectTo),
    ),
  });

  return <AuthForm
    {...props}
    isPending={credentials.isPending || socialMutation.isPending}
    onSubmitValues={async (values) => {
      const input = {
        role: props.role,
        email: values.email,
        password: values.password,
      };
      const { user } = await credentials.mutateAsync(props.mode === "signup"
        ? { ...input, mode: "signup", name: values.name, phone: values.phone }
        : { ...input, mode: "login" });
      router.replace(resolveAuthenticatedPath(user, props.redirectTo));
    }}
    onSocialLogin={async (provider) => {
      const { url } = await socialMutation.mutateAsync(provider);
      window.location.assign(url);
    }}
  />;
}
