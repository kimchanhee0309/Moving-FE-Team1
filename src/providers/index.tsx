"use client";

import type { PropsWithChildren } from "react";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
