import localFont from "next/font/local";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { Providers } from "@/providers";

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

export const metadata: Metadata = {
  title: "무빙",
  description: "믿을 수 있는 이사 견적 매칭 서비스",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
