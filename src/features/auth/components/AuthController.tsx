"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { beginSocialLogin } from "../auth.api";
import type { AuthScreenProps, SocialProvider } from "../auth.types";
import { resolveAuthenticatedPath, safeAuthRedirect } from "../auth.utils";
import { useAuth } from "../hooks/useAuth";
import { AuthForm } from "./AuthForm";

/** Provider의 이메일 인증 명령을 사용하고 현재 화면의 안전한 이동 경로를 결정합니다. */
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
