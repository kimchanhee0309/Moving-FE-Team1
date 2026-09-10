"use client";

import { useRouter } from "next/navigation";
import { beginSocialLogin } from "../auth.api";
import type { AuthScreenProps } from "../auth.types";
import { getAuthSuccessPath, safeAuthRedirect } from "../auth.utils";
import { useAuthSubmit } from "../hooks/useAuth";
import { AuthForm } from "./AuthForm";

/** 인증 성공 후 서버가 반환한 역할과 프로필 상태에 맞는 페이지로 이동합니다. */
export function AuthController(props:AuthScreenProps) {
  const router=useRouter();
  const mutation=useAuthSubmit(props.mode,props.role);
  return <AuthForm {...props} onSubmitValues={async(values)=>{
    const {user}=await mutation.mutateAsync(values);
    router.replace(getAuthSuccessPath(user, props.redirectTo));
  }} onSocialLogin={async(provider)=>{
    const {url}=await beginSocialLogin(provider,props.role,safeAuthRedirect(props.redirectTo));
    window.location.assign(url);
  }}/>;
}
