import { redirect } from "@/i18n/navigation";

import { ROUTES } from "@/common/constants/routes";
import { authPageMetadata } from "@/i18n/metadata";

export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return authPageMetadata(params, "forgotPassword");
}

export default async function ForgotPasswordPage({ searchParams, params }: { searchParams: Promise<{ role?: string }>; params: Promise<{ locale: string }> }) {
  const [{ role }, { locale }] = await Promise.all([searchParams, params]);
  const loginPath = role === "MOVER" ? ROUTES.AUTH.LOGIN.MOVER : ROUTES.AUTH.LOGIN.CUSTOMER;
  redirect({ href: `${loginPath}?${new URLSearchParams({ recovery: "forgot-password" })}`, locale });
}
