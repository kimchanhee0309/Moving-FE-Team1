"use client";

import type { PropsWithChildren } from "react";
import { ModalProvider } from "./ModalProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";
import { NotificationProvider } from "./NotificationProvider";

/**
 * 루트 layout 연결점. Query 위에서 Auth를 구성하고, 그 아래 Notification을 두어 SSE 구독이
 * useAuth를 그대로 쓸 수 있게 합니다. 모달·모든 라우트 그룹은 이 Provider들의 동일한 Context를
 * 공유합니다.
 */
export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <NotificationProvider>
          <ModalProvider>{children}</ModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
