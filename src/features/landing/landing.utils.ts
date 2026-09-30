import { ROUTES } from "@/common/constants/routes";
import { authHref } from "@/features/auth/auth.utils";
import type { AuthUser } from "@/features/auth/auth.types";

/** 세션 상태별 랜딩 CTA 목적지를 한곳에서 결정합니다. */
export function resolveLandingHrefs(user: Pick<AuthUser, "role"> | null) {
  return {
    requestHref: user?.role === "CUSTOMER"
      ? ROUTES.CUSTOMER.MOVE_REQUEST
      : user?.role === "MOVER"
        ? ROUTES.MOVER.REQUESTS
        : authHref(ROUTES.AUTH.LOGIN.CUSTOMER, ROUTES.CUSTOMER.MOVE_REQUEST),
    quoteHref: user?.role === "CUSTOMER"
      ? ROUTES.CUSTOMER.QUOTE.PENDING
      : user?.role === "MOVER"
        ? ROUTES.MOVER.QUOTE.LIST
        : authHref(ROUTES.AUTH.LOGIN.CUSTOMER, ROUTES.CUSTOMER.QUOTE.PENDING),
  };
}
