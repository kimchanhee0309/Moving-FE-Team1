"use client";

import { useRouter } from "next/navigation";
import { beginSocialLogin } from "../auth.api";
import type { AuthScreenProps } from "../auth.types";
import { safeAuthRedirect } from "../auth.utils";
import { useAuthSubmit } from "../hooks/useAuth";
import { AuthForm } from "./AuthForm";

/** 성공을 확인한 뒤에만 이동합니다. 미등록 프로필은 홈에서 세션을 유지하며 전용 기능은 guard가 제한합니다. */
export function AuthController(props:AuthScreenProps) {
  const router=useRouter();
  const mutation=useAuthSubmit(props.mode,props.role);
  return <AuthForm {...props} onSubmitValues={async(values)=>{
    const {user}=await mutation.mutateAsync(values);
    const target=safeAuthRedirect(props.redirectTo);
    router.replace(user.profileCompleted&&target&&!target.startsWith("/auth/")&&!target.startsWith("/login/")&&!target.startsWith("/signup/")?target:"/");
  }} onSocialLogin={async(provider)=>{
    const {url}=await beginSocialLogin(provider,props.role,safeAuthRedirect(props.redirectTo));
    window.location.assign(url);
  }}/>;
}
