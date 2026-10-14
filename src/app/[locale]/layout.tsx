import localFont from "next/font/local";
import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { preconnect } from "react-dom";
import "../globals.css";

import { ENV } from "@/common/constants/env";
import { Providers } from "@/providers";
import { routing } from "@/i18n/routing";

const pretendard = localFont({
  src: "../../../public/fonts/PretendardVariable.core.woff2",
  variable: "--font-pretendard",
  display: "swap",
  // 핵심 서브셋은 화면에서 쓰는 굵기(400~900)만 담아 용량을 줄였습니다. 더 얇은 굵기가 필요해지면 서브셋을 다시 만들어야 합니다.
  weight: "400 900",
  // 핵심 서브셋에 없는 글자는 globals.css의 다음 순위 "Pretendard Variable" 조각으로 넘어가야 하므로,
  // 그 사이에 끼어드는 Arial 기반 대체 폰트를 만들지 않습니다.
  adjustFontFallback: false,
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

// 모든 페이지가 hydration 직후 AuthProvider의 세션 확인으로 백엔드를 호출하므로, HTML을 받는 동안 연결(DNS·TLS)을 미리 맺어 둡니다.
// apiClient가 credentials: "include"로 요청하므로 crossOrigin을 주지 않습니다. 주면 쿠키 없는 별도 연결이 열려 재사용되지 않습니다.
const API_ORIGIN = URL.canParse(ENV.API_URL) ? new URL(ENV.API_URL).origin : null;

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
  if (API_ORIGIN) preconnect(API_ORIGIN);

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
