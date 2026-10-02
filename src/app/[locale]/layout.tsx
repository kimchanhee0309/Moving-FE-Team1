import localFont from "next/font/local";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import "../globals.css";

import { Providers } from "@/providers";
import { routing } from "@/i18n/routing";

const pretendard = localFont({
  src: "../../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const common = await getTranslations({ locale, namespace: "Common" });
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: common("brand"),
    description: t("description"),
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      title: common("brand"),
      description: t("openGraphDescription"),
      siteName: common("brand"),
      locale: OPEN_GRAPH_LOCALE[locale],
      type: "website",
    },
    twitter: {
      card: "summary",
      title: common("brand"),
      description: t("description"),
    },
  };
}

const OPEN_GRAPH_LOCALE: Record<(typeof routing.locales)[number], string> = {
  ko: "ko_KR",
  en: "en_US",
  zh: "zh_CN",
  ja: "ja_JP",
};

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} className={pretendard.variable}>
      <body>
        <NextIntlClientProvider>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
