import type { ReactNode } from "react";

import { GnbContainer } from "@/common/components/gnb/GnbContainer";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function MoverLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GnbContainer />
      <AuthGuard role="MOVER">{children}</AuthGuard>
    </>
  );
}
