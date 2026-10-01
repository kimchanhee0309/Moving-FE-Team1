import type { Metadata } from "next";

import { AuthScreen } from "@/features/auth/components/AuthScreen";
import { safeAuthRedirect } from "@/features/auth/auth.utils";

export const metadata: Metadata = { title: "기사님 회원가입 | 무빙" };

/** 역할과 모드를 고정해 폼을 조합하고 원래 목적지 파라미터만 안전하게 전달합니다. */
export default async function Page({ searchParams }: { searchParams: Promise<{ redirect?: string | string[] }> }) {
  const { redirect } = await searchParams;
  return <AuthScreen role="MOVER" mode="signup" redirectTo={safeAuthRedirect(redirect)} />;
}
