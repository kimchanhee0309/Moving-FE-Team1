import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROUTES } from "@/common/constants/routes";

export const metadata: Metadata = { title: "아이디 찾기 | 무빙" };

export default async function FindAccountPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role } = await searchParams;
  const loginPath = role === "MOVER" ? ROUTES.AUTH.LOGIN.MOVER : ROUTES.AUTH.LOGIN.CUSTOMER;
  redirect(`${loginPath}?${new URLSearchParams({ recovery: "find-account" })}`);
}
