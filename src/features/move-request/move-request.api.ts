import { apiClient } from "@/common/api/client";

import type {
  CreateMoveRequestPayload,
  DesignatedRequestDto,
  MoveRequestDto,
} from "./move-request.types";

/**
 * 이사 견적 요청 생성/조회 REST 호출입니다. `credentials: "include"`와 오류 변환은
 * 공통 `apiClient`가 담당하므로 이 파일은 endpoint 호출만 책임집니다.
 */

/** `POST /customers/me/move-requests` — 새 이사 견적 요청을 생성합니다(활성 요청이 있으면 409). */
export function createMoveRequest(payload: CreateMoveRequestPayload) {
  return apiClient<{ moveRequest: MoveRequestDto }>("/customers/me/move-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** `GET /customers/me/move-requests/active` — 현재 활성 요청을 조회합니다(없으면 `moveRequest: null`). */
export function fetchActiveMoveRequest() {
  return apiClient<{ moveRequest: MoveRequestDto | null }>(
    "/customers/me/move-requests/active",
  );
}

/**
 * `POST /customers/me/move-requests/:moveRequestId/designated-requests` —
 * 활성 일반 요청에 기사님 지정 요청을 추가합니다(최대 3명).
 */
export function createDesignatedRequest(
  moveRequestId: string,
  moverId: string,
) {
  return apiClient<{ designatedRequest: DesignatedRequestDto }>(
    `/customers/me/move-requests/${moveRequestId}/designated-requests`,
    {
      method: "POST",
      body: JSON.stringify({ moverId }),
    },
  );
}
