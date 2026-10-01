import { redirect } from "next/navigation";

import { ROUTES } from "@/common/constants/routes";

/** 이전 이메일 링크가 남아 있어도 비밀번호를 표시하지 않고 새 복구 흐름으로 안내합니다. */
export default async function LegacyResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const loginPath = role === "MOVER" ? ROUTES.AUTH.LOGIN.MOVER : ROUTES.AUTH.LOGIN.CUSTOMER;
  redirect(`${loginPath}?${new URLSearchParams({ recovery: "forgot-password" })}`);
}
