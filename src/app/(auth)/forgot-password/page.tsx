import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/common/constants/routes";

export const metadata: Metadata = { title: "비밀번호 찾기 | 무빙" };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const loginPath = role === "MOVER" ? ROUTES.AUTH.LOGIN.MOVER : ROUTES.AUTH.LOGIN.CUSTOMER;
  redirect(`${loginPath}?${new URLSearchParams({ recovery: "forgot-password" })}`);
}
