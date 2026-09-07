"use client";

import localFont from "next/font/local";
import { useEffect } from "react";

import { ErrorState } from "@/common/components/page-state";

import "./globals.css";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

interface GlobalErrorProps {
  error: Error & {
    digest?: string;
  };
  retry: () => void;
}

export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <title>오류 | 무빙</title>

        <main className="flex min-h-screen items-center justify-center bg-[var(--background-100)]">
          <div className="w-full">
            <ErrorState
              title="서비스를 불러오지 못했어요."
              description="일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
              onRetry={retry}
            />

            {error.digest && (
              <p className="text-center text-[12px] text-[var(--content-muted)]">
                오류 코드: {error.digest}
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
