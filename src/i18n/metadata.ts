import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type AuthTitleKey = "customerLogin" | "moverLogin" | "customerSignup" | "moverSignup" | "findAccount" | "forgotPassword";

export async function authPageMetadata(params: Promise<{ locale: string }>, key: AuthTitleKey): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t(key) };
}
