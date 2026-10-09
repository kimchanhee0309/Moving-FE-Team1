"use client";

import { useMutation } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { beginSocialLogin } from "../auth.api";
import type { AuthScreenProps, SocialProvider } from "../auth.types";
import { authNavigationTarget, localizedAuthRedirect, resolveCredentialsPath } from "../auth.utils";
import { ROUTES } from "@/common/constants/routes";
import { useAuth } from "../hooks/useAuth";
import { AuthForm } from "./AuthForm";

/**
 * 역할별 로그인/회원가입 페이지와 AuthForm 사이의 연동 컨테이너입니다.
 * 이메일 인증은 루트 Provider의 명령을 사용하며 사용자 상태를 이 화면에 따로 저장하지 않습니다.
 * 이메일 회원가입은 역할별 프로필 등록으로, 로그인은 서버 profileCompleted에 맞는 화면으로 이동합니다.
 * SNS 시작 pending만 화면에서 관리합니다.
 */
export function AuthController(props: AuthScreenProps) {
  const router = useRouter();
  const locale = useLocale();
  const { credentials } = useAuth();
  const socialMutation = useMutation({
    mutationFn: (provider: SocialProvider) => beginSocialLogin(
      provider, props.role, localizedAuthRedirect(
        props.redirectTo ?? (props.role === "MOVER" ? ROUTES.MOVER.MY_PAGE : ROUTES.PUBLIC.MOVER_SEARCH),
        locale,
      ),
    ),
  });

  return <AuthForm
    {...props}
    isPending={credentials.isPending || socialMutation.isPending}
    onSubmitValues={async (values, emailVerificationToken) => {
      const input = {
        role: props.role,
        email: values.email,
        password: values.password,
      };
      let user;
      if (props.mode === "signup") {
        ({ user } = await credentials.mutateAsync({ ...input, mode: "signup", name: values.name, phone: values.phone, emailVerificationToken }));
      } else {
        ({ user } = await credentials.mutateAsync({ ...input, mode: "login" }));
      }
      const target = authNavigationTarget(resolveCredentialsPath(props.mode, user, props.redirectTo), locale);
      router.replace(target.href, { locale: target.locale });
    }}
    onSocialLogin={async (provider) => {
      const { url } = await socialMutation.mutateAsync(provider);
      window.location.assign(url);
    }}
  />;
}
