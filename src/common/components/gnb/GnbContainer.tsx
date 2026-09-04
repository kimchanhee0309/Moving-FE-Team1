"use client";

import { Gnb } from "./Gnb";
import type { GnbAuthenticatedUser } from "./gnb.types";

/**
 * TODO: mock, 실제 인증 Provider 연동 시 교체.
 *
 * 인증 담당자(AGENTS.md 담당 영역 표: 이승재)가 `AuthProvider`/`useAuth()`(가칭)를 만들면
 * 아래 하드코딩된 mock 대신 그 훅에서 로그인 여부와 사용자 정보를 받아오도록 이 함수 하나만
 * 바꾸면 된다. 현재는 `src/providers`에 인증 상태를 실제로 관리하는 Provider가 없어(주석 처리된
 * `AuthProvider` 참고) 값을 추측해서 만들지 않고, 테스트하기 쉽도록 customer로 로그인된 상태를
 * 고정 mock으로 둔다.
 */
function useMockAuth():
  | { isAuthenticated: false }
  | { isAuthenticated: true; user: GnbAuthenticatedUser } {
  return {
    isAuthenticated: true,
    user: { role: "CUSTOMER", name: "홍길동" },
  };
}

/**
 * `(public)`, `(customer)`, `(mover)` 레이아웃에서 공통으로 마운트하는 GNB 래퍼.
 *
 * mock 인증 데이터를 `<Gnb>`에 연결하는 조립 로직을 한 곳에 모아, 3개 layout 파일이
 * 이 컴포넌트를 import하기만 하면 되도록 한다. `Gnb` 자체는 API 호출/인증 상태를 직접 갖지 않는
 * controlled 컴포넌트(공통 컴포넌트 원칙)이므로, 실제 인증 상태를 주입하는 책임은 이 컨테이너가 진다.
 */
export function GnbContainer() {
  const auth = useMockAuth();

  if (!auth.isAuthenticated) {
    return <Gnb isAuthenticated={false} />;
  }

  // TODO: mock, 실제 로그아웃 API/세션 정리 로직이 준비되면 onLogout으로 연결한다.
  // 지금은 생략해 드롭다운의 "로그아웃" 항목이 닫기 동작만 하도록 둔다.
  return <Gnb isAuthenticated user={auth.user} />;
}
