"use client";

import { useRouter } from "next/navigation";
import { beginSocialLogin } from "../auth.api";
import type { AuthScreenProps } from "../auth.types";
import { resolveAuthenticatedPath, safeAuthRedirect } from "../auth.utils";
import { useAuthSubmit } from "../hooks/useAuth";
import { AuthForm } from "./AuthForm";

/** 성공을 확인한 뒤 프로필 등록 여부와 원래 목적지에 맞는 화면으로 이동합니다. */
export function AuthController(props:AuthScreenProps) {
  const router=useRouter();
  const mutation=useAuthSubmit(props.mode,props.role);
  return <AuthForm {...props} onSubmitValues={async(values)=>{
    const {user}=await mutation.mutateAsync(values);
    router.replace(resolveAuthenticatedPath(user, props.redirectTo));
  }} onSocialLogin={async(provider)=>{
    const {url}=await beginSocialLogin(provider,props.role,safeAuthRedirect(props.redirectTo));
    window.location.assign(url);
  }}/>;
}
