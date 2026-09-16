import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { getAuthAccess } from "./access";
import type { ApiRequestOptions } from "@/common/api/client";
import { ACCESS_TOKEN_COOKIE, fetchRequestSession } from "./request-session.api";
import type { AuthAccess, UserRole } from "./types";

/**
 * 인증이 필요한 Server Component에서만 호출하는 요청별 사용자 조회입니다.
 * Next 요청의 HttpOnly Access 쿠키를 읽고 /auth/me에 전달합니다. JWT 검증은 백엔드 책임입니다.
 * React cache는 같은 서버 렌더 안에서만 조회를 공유하며 다른 요청·사용자의 결과를 저장하지 않습니다.
 * Refresh/Set-Cookie는 하지 않고 클라이언트 AuthProvider의 Query 상태도 변경하지 않습니다.
 */
export const getServerSession = cache(async () => {
  const cookieStore = await cookies();
  return fetchRequestSession(cookieStore.get(ACCESS_TOKEN_COOKIE)?.value);
});

/** 서버의 개인 데이터 API에도 같은 요청의 Access를 전달합니다. apiClient options로만 사용하고 클라이언트 props에 넣지 않습니다. */
export async function getServerAuthRequestOptions(): Promise<ApiRequestOptions> {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  return {
    headers: accessToken ? { Cookie: `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}` } : {},
    cache: "no-store",
  };
}

/** 서버 사용자·역할·프로필 상태를 기존 접근 규칙으로 판정합니다. 이동/오류 UI는 호출 페이지가 담당합니다. */
export async function getServerAuthAccess(
  role: UserRole,
  allowIncompleteProfile = false,
): Promise<Awaited<ReturnType<typeof getServerSession>> & { access: AuthAccess }> {
  const session = await getServerSession();
  return {
    ...session,
    access: getAuthAccess(session.user, session.status, role, allowIncompleteProfile),
  };
}
