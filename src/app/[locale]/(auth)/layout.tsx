import type { ReactNode } from "react";

import { Gnb } from "@/common/components/gnb";

/** 로그인/가입 화면은 비회원 GNB를 공통 사용합니다. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <><Gnb isAuthenticated={false} />{children}</>;
}
