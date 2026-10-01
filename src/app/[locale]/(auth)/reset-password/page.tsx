import { redirect } from "@/i18n/navigation";

import { ROUTES } from "@/common/constants/routes";

/** 이전 이메일 링크가 남아 있어도 비밀번호를 표시하지 않고 새 복구 흐름으로 안내합니다. */
export default async function LegacyResetPasswordPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ role?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const [{ role }, { locale }] = await Promise.all([searchParams, params]);
  const loginPath = role === "MOVER" ? ROUTES.AUTH.LOGIN.MOVER : ROUTES.AUTH.LOGIN.CUSTOMER;
  redirect({ href: `${loginPath}?${new URLSearchParams({ recovery: "forgot-password" })}`, locale });
}
