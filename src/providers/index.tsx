"use client";

import type { PropsWithChildren } from "react";
import { ModalProvider } from "./modal-provider";
import { QueryProvider } from "./query-provider";
/*import { AuthProvider } from "./auth-provider";*/

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ModalProvider>{children}</ModalProvider>
    </QueryProvider>
  );
}
