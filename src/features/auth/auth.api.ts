import { apiClient } from "@/common/api/client";
import { ApiError } from "@/common/api/error";
import type { UserRole } from "@/common/auth/types";
import type { AuthFormValues, AuthMode, AuthUser, SocialProvider } from "./auth.types";

let pending:Promise<unknown>=Promise.resolve();
/** 같은 origin의 여러 탭에서도 쿠키 변경 요청을 직렬화합니다. 미지원 브라우저는 탭 안에서 직렬화합니다. */
async function withAuthLock<T>(operation:()=>Promise<T>):Promise<T> {
  if(typeof navigator!=="undefined"&&navigator.locks)return await navigator.locks.request("moving-auth-session",operation);
  const result=pending.then(operation,operation);
  pending=result.catch(()=>undefined);
  return result;
}

/** 가입 확인 비밀번호는 전송하지 않으며 role은 진입한 인증 화면에서 결정합니다. */
export async function submitCredentials(mode:AuthMode,role:UserRole,values:AuthFormValues) {
  const payload = {email:values.email.trim(),password:values.password,role,...(mode==="signup"?{name:values.name.trim(),phone:values.phone}:{})};
  return withAuthLock(()=>apiClient<{user:AuthUser}>(`/auth/${mode}`,{method:"POST",body:JSON.stringify(payload)}));
}

// 여러 컴포넌트의 동시 조회에서도 refresh는 한 번만 실행합니다.
let refreshRequest:Promise<{user:AuthUser}>|null=null;
async function readSession():Promise<AuthUser|null> {
  try {return (await apiClient<{user:AuthUser}>("/auth/me")).user;}
  catch(error) {if(!(error instanceof ApiError)||error.status!==401)throw error;}
  try {
    refreshRequest ??= apiClient<{user:AuthUser}>("/auth/refresh",{method:"POST"}).finally(()=>{refreshRequest=null;});
    return (await refreshRequest).user;
  } catch(error) {if(error instanceof ApiError&&error.status===401)return null;throw error;}
}
export const fetchSession=()=>withAuthLock(readSession);
export const logoutSession = () => withAuthLock(()=>apiClient<void>("/auth/logout",{method:"POST"}));

/** 쿠키가 설정된 뒤 공급자 페이지로 이동합니다. 서버의 설정 오류도 현재 폼에서 안내합니다. */
export function beginSocialLogin(provider:SocialProvider,role:UserRole,redirect?:string) {
  return apiClient<{url:string}>(`/auth/oauth/${provider}`,{query:{role,redirect,format:"json"}});
}
