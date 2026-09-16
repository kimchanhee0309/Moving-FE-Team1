"use client";

import type { PropsWithChildren } from "react";
import { ModalProvider } from "./ModalProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";

/** 루트 layout 연결점. Query 위에서 Auth를 구성하고 모달·모든 라우트 그룹에 동일한 인증 Context를 제공합니다. */
export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ModalProvider>{children}</ModalProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
