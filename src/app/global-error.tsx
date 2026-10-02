"use client";

import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { useEffect, useSyncExternalStore } from "react";

import { ErrorState } from "@/common/components/page-state";
import { routing } from "@/i18n/routing";

import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

type AppLocale = (typeof routing.locales)[number];

// 루트 layout까지 실패한 경우라 서버 메시지를 읽지 못하므로, 이 화면에 필요한 최소 문구만 둡니다.
const GLOBAL_ERROR_COPY: Record<AppLocale, { title: string; pageTitle: string; description: string; retry: string; code: string }> = {
  ko: {
    pageTitle: "오류 | 무빙",
    title: "서비스를 불러오지 못했어요.",
    description: "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    retry: "다시 시도",
    code: "오류 코드",
  },
  en: {
    pageTitle: "Error | Moving",
    title: "Could not load the service.",
    description: "A temporary problem occurred. Please try again shortly.",
    retry: "Try again",
    code: "Error code",
  },
  zh: {
    pageTitle: "错误 | Moving",
    title: "无法加载服务。",
    description: "发生了临时问题，请稍后重试。",
    retry: "重试",
    code: "错误代码",
  },
  ja: {
    pageTitle: "エラー | ムービング",
    title: "サービスを読み込めませんでした。",
    description: "一時的な問題が発生しました。しばらくしてからもう一度お試しください。",
    retry: "再試行",
    code: "エラーコード",
  },
};

function getPathLocale(): AppLocale {
  const prefix = window.location.pathname.split("/")[1];
  return routing.locales.find((locale) => locale === prefix) ?? routing.defaultLocale;
}

interface GlobalErrorProps {
  error: Error & {
    digest?: string;
  };
  retry: () => void;
}

export default function GlobalError({ error, retry }: GlobalErrorProps) {
  const locale = useSyncExternalStore(
    () => () => {},
    getPathLocale,
    () => routing.defaultLocale,
  );
  const copy = GLOBAL_ERROR_COPY[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={locale} className={pretendard.variable}>
      <body>
        <title>{copy.pageTitle}</title>

        {/* 공통 ErrorState가 next-intl hook을 쓰므로 locale layout 밖인 이 화면에도 최소 Provider를 둡니다. */}
        <NextIntlClientProvider locale={locale} messages={{ Common: { errorTitle: copy.title, errorDescription: copy.description, retry: copy.retry } }}>
          <main className="flex min-h-screen items-center justify-center bg-[var(--background-100)]">
            <div className="w-full">
              <ErrorState
                title={copy.title}
                description={copy.description}
                onRetry={retry}
                retryLabel={copy.retry}
              />

              {error.digest && (
                <p className="text-center text-[12px] text-[var(--content-muted)]">
                  {copy.code}: {error.digest}
                </p>
              )}
            </div>
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
