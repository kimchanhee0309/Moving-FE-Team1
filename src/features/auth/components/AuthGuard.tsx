"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import type { UserRole } from "@/common/auth/types";
import { useAuth } from "../hooks/useAuth";
import { authHref } from "../auth.utils";

/** 화면 안내용 guard입니다. 데이터 권한은 백엔드 requireAuth에서도 검사해야 합니다. */
export function AuthGuard({role,children}:{role:UserRole;children:ReactNode}) {
  const {user,isPending,error}=useAuth();
  const path=usePathname(),router=useRouter();
  const rolePath=role==="MOVER"?"mover":"customer";
  const login=authHref(`/login/${rolePath}`,path);
  useEffect(()=>{if(!isPending&&!user&&!error)router.replace(login);},[isPending,user,error,login,router]);
  if(isPending)return <p role="status" className="p-8 text-center">로그인 정보를 확인하고 있습니다.</p>;
  if(error)return <p role="alert" className="p-8 text-center">로그인 정보를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.</p>;
  if(!user)return null;
  if(user.role!==role)return <p role="alert" className="p-8 text-center">현재 계정으로 이용할 수 없는 페이지입니다. <Link href="/" className="underline">홈으로 이동</Link></p>;
  if(!user.profileCompleted&&!path.startsWith(`/${rolePath}-profile/`))return <p role="status" className="p-8 text-center">프로필 등록 후 이용할 수 있습니다. <Link href={`/${rolePath}-profile/register`} className="underline">프로필 등록</Link></p>;
  return children;
}
