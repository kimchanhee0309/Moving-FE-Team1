import { apiClient } from "@/common/api/client";

import type {
  CreateMoveRequestPayload,
  DesignatedRequestDto,
  MoveRequestDto,
  UpdateMoveRequestPayload,
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
 * `PATCH /customers/me/move-requests/:moveRequestId` — 활성 요청의 이사 유형/예정일/주소를 수정합니다.
 *
 * TODO(feature-implementer, 확인 담당: 노진우): 이 endpoint는 이 작업과 같은 시점에 다른 agent가
 * BE에 추가하고 있어 아직 실제 왕복 테스트를 못 했다. `createMoveRequest`와 대칭 계약(성공 시
 * `{ moveRequest }`)이라는 전제로 구현했으니, BE가 준비되면 실제 응답 shape을 다시 확인해야 한다.
 */
export function updateMoveRequest(moveRequestId: string, payload: UpdateMoveRequestPayload) {
  return apiClient<{ moveRequest: MoveRequestDto }>(
    `/customers/me/move-requests/${moveRequestId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

/**
 * `DELETE /customers/me/move-requests/:moveRequestId` — 활성 요청을 삭제합니다(성공 시 204 No Content).
 *
 * TODO(feature-implementer, 확인 담당: 노진우): `updateMoveRequest`와 같은 이유로 아직 실제
 * 왕복 테스트를 못 했다. `apiClient`는 204 응답을 `undefined`로 반환하므로 이 함수의 반환값은
 * 항상 무시하고 호출부는 성공 여부만 본다.
 */
export function deleteMoveRequest(moveRequestId: string) {
  return apiClient<void>(`/customers/me/move-requests/${moveRequestId}`, {
    method: "DELETE",
  });
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
