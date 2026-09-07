import type { ReactNode } from "react";

import { Gnb } from "@/common/components/gnb";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* 인증 API 연결 전에는 가짜 로그인 사용자 대신 비회원 메뉴를 표시합니다. */}
      <Gnb isAuthenticated={false} />
      {children}
    </>
  );
}
