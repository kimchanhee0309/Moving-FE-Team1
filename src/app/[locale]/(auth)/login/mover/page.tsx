import { authPageMetadata } from "@/i18n/metadata";

import { AuthScreen } from "@/features/auth/components/AuthScreen";
import type { RecoveryMode } from "@/features/auth/auth.types";
import { safeAuthRedirect } from "@/features/auth/auth.utils";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return authPageMetadata(params, "moverLogin");
}

/** 역할과 모드를 고정해 폼을 조합하고 원래 목적지 파라미터만 안전하게 전달합니다. */
export default async function Page({ searchParams }: { searchParams: Promise<{ redirect?: string | string[]; recovery?: string | string[] }> }) {
  const { redirect, recovery } = await searchParams;
  const initialRecoveryMode = (recovery === "find-account" || recovery === "forgot-password" ? recovery : undefined) satisfies RecoveryMode | undefined;
  return <AuthScreen role="MOVER" mode="login" redirectTo={safeAuthRedirect(redirect)} initialRecoveryMode={initialRecoveryMode} />;
}
