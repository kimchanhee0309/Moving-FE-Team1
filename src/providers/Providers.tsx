"use client";

import type { PropsWithChildren } from "react";
import { ModalProvider } from "./ModalProvider";
import { QueryProvider } from "./QueryProvider";
import { AuthProvider } from "./AuthProvider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ModalProvider>{children}</ModalProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
