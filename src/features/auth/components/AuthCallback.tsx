"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { safeAuthRedirect } from "../auth.utils";

const MESSAGES:Record<string,string>={
  OAUTH_CANCELLED:"SNS 로그인이 취소되었습니다.",
  OAUTH_INVALID_STATE:"로그인 요청이 만료되었거나 유효하지 않습니다. 다시 시작해 주세요.",
  OAUTH_ACCOUNT_CONFLICT:"같은 이메일로 가입된 계정이 있습니다. 기존 로그인 방법을 이용해 주세요.",
  ROLE_MISMATCH:"가입한 계정 유형의 로그인 페이지를 이용해 주세요.",
};

/** URL의 성공 표시를 신뢰하지 않고 서버 세션을 확인한 뒤 이동합니다. */
export function AuthCallback({error,role,redirect}:{error?:string;role?:string;redirect?:string}) {
  const auth=useAuth(),router=useRouter();
  useEffect(()=>{
    if(!error&&!auth.isPending&&auth.user) {
      const target=safeAuthRedirect(redirect);
      router.replace(auth.user.profileCompleted&&target&&!/^\/(auth|login|signup)(\/|$)/.test(target)?target:"/");
    }
  },[error,auth.isPending,auth.user,redirect,router]);
  const failed=!!error||(!auth.isPending&&!auth.user);
  return <main className="mx-auto max-w-xl px-6 py-20 text-center">
    <h1 className="text-2xl-bold">SNS 로그인</h1>
    <p className="my-6" role={failed?"alert":"status"}>{failed?(error&&MESSAGES[error])||"로그인을 완료하지 못했습니다. 다시 시도해 주세요.":"로그인 정보를 확인하고 있습니다."}</p>
    {failed&&<Link className="text-(--primary-400) underline" href={`/login/${role==="MOVER"?"mover":"customer"}`}>로그인 화면으로 돌아가기</Link>}
  </main>;
}
