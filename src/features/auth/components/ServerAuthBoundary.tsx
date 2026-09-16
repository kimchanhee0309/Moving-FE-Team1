import "server-only";

import type { ReactNode } from "react";

import { canRecoverAuthAccess } from "@/common/auth/access";
import { getServerAuthAccess } from "@/common/auth/server";
import type { AuthUser, UserRole } from "@/common/auth/types";
import { ServerSessionRecovery } from "./ServerSessionRecovery";

interface ServerAuthBoundaryProps {
  role: UserRole;
  /** 프로필 최초 등록 페이지에서만 true로 지정합니다. */
  allowIncompleteProfile?: boolean;
  /** 서버 인증이 허용된 경우에만 실행합니다. 개인 데이터 API 조회는 이 함수 안에서 수행합니다. */
  render: (user: AuthUser) => ReactNode | Promise<ReactNode>;
}

/**
 * 팀원용 Server Component 인증 경계입니다. 서버 실패 시 개인정보를 렌더/전송하지 않습니다.
 * 브라우저 Provider가 갱신한 뒤 서버를 재조회하며 Error 객체·토큰은 클라이언트 props로 전달하지 않습니다.
 * 실제 리소스 인가는 render에서 호출하는 백엔드 API가 담당합니다.
 */
export async function ServerAuthBoundary({ role, allowIncompleteProfile = false, render }: ServerAuthBoundaryProps) {
  const session = await getServerAuthAccess(role, allowIncompleteProfile);
  const hasServerAccess = session.access === "allowed" && session.user !== null;
  const shouldRecoverSession = canRecoverAuthAccess(session.access);
  return <ServerSessionRecovery role={role} hasServerAccess={hasServerAccess} shouldRecoverSession={shouldRecoverSession}>
    {hasServerAccess && session.user ? await render(session.user) : null}
  </ServerSessionRecovery>;
}
