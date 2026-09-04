import type { ReactNode } from "react";

import { GnbContainer } from "@/common/components/gnb/GnbContainer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GnbContainer />
      {children}
    </>
  );
}
