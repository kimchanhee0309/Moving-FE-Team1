import type { ReactNode } from "react";

import { GnbContainer } from "@/common/components/gnb/GnbContainer";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GnbContainer />
      {children}
    </>
  );
}
