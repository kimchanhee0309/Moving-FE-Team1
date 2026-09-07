"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSession, logoutSession, submitCredentials } from "../auth.api";
import type { AuthFormValues, AuthMode, AuthUser } from "../auth.types";
import type { UserRole } from "@/common/auth/types";

export const AUTH_QUERY_KEY = ["auth","session"] as const;

/** 로그인 상태는 서버 조회 결과로 관리합니다. 토큰을 localStorage에 복사하지 않습니다. */
export function useAuth() {
  const client=useQueryClient();
  const session=useQuery({queryKey:AUTH_QUERY_KEY,queryFn:fetchSession,retry:false,staleTime:30_000,refetchInterval:5*60_000,refetchOnWindowFocus:true});
  const logout=useMutation({mutationFn:logoutSession,onSuccess:async()=>{
    await client.cancelQueries();
    client.clear();
    client.setQueryData(AUTH_QUERY_KEY,null);
  }});
  return {user:session.data??null,isPending:session.isPending,error:session.error,logout,refetch:session.refetch};
}

export function useAuthSubmit(mode:AuthMode,role:UserRole) {
  const client=useQueryClient();
  return useMutation({mutationFn:(values:AuthFormValues)=>submitCredentials(mode,role,values),onSuccess:async({user})=>{
    // 이전 계정의 지연 응답/캐시가 새 계정에 노출되지 않게 비운 뒤 세션을 저장합니다.
    await client.cancelQueries();
    client.clear();
    client.setQueryData<AuthUser>(AUTH_QUERY_KEY,user);
  }});
}
