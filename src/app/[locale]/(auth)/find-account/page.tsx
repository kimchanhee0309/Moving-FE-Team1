import { redirect } from "@/i18n/navigation";

import { ROUTES } from "@/common/constants/routes";
import { authPageMetadata } from "@/i18n/metadata";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return authPageMetadata(params, "forgotPassword");
}

/**
 * 아이디 찾기 제거 전 공유된 /find-account 링크의 호환 경로입니다.
 * 로그인 ID가 이메일이므로 같은 역할의 로그인 화면에서 비밀번호 찾기 모달을 엽니다.
 */
export default async function FindAccountPage({ searchParams, params }: { searchParams: Promise<{ role?: string }>; params: Promise<{ locale: string }> }) {
  const [{ role }, { locale }] = await Promise.all([searchParams, params]);
  const loginPath = role === "MOVER" ? ROUTES.AUTH.LOGIN.MOVER : ROUTES.AUTH.LOGIN.CUSTOMER;
  redirect({ href: `${loginPath}?${new URLSearchParams({ recovery: "forgot-password" })}`, locale });
}
