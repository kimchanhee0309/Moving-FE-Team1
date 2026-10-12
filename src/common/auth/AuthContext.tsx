"use client";

import { createContext, useContext } from "react";
import type { AuthContextValue } from "./types";

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Context만 소비합니다. 공개 페이지에서 호출해도 인증 가드나 추가 Query를 만들지 않습니다. */
export function useAuth(): AuthContextValue {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth는 루트 AuthProvider 안에서 사용해야 합니다.");
  return auth;
}
