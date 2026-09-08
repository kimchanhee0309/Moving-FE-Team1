"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Gnb } from "./Gnb";

/** 서버 세션을 GNB에 연결합니다. 로그아웃 실패 시 세션을 임의로 지우지 않습니다. */
export function GnbContainer() {
  const router=useRouter();
  const {user,isPending,logout}=useAuth();
  return <>
    <div aria-busy={isPending||logout.isPending}>
      {user?<Gnb isAuthenticated user={{name:user.name,role:user.role}} onLogout={()=>{
        if(!logout.isPending)logout.mutate(undefined,{onSuccess:()=>router.replace("/")});
      }}/>:<Gnb isAuthenticated={false}/>}
    </div>
    {logout.isError&&<p role="alert" className="p-4 text-center text-(--primary-400)">로그아웃하지 못했습니다. 다시 시도해 주세요.</p>}
  </>;
}
