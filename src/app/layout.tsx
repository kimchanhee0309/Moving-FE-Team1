import localFont from "next/font/local";
import type { PropsWithChildren } from "react";
import "./globals.css";

import { Providers } from "@/providers";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "100 900",
});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
