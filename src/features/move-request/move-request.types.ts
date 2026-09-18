import type { MoveRequestStatus, ServiceType } from "@/common/constants/domain";

/**
 * `POST /customers/me/move-requests`, `GET /customers/me/move-requests/active`가 공유하는
 * MoveRequest 응답 DTO입니다. Moving BE `docs/move-request-api.md`, `move-request.dto.ts` 기준이며
 * Prisma model을 그대로 옮기지 않고 API가 실제로 내려주는 필드만 둡니다.
 */
export interface MoveRequestDto {
  id: string;
  serviceType: ServiceType;
  /** ISO 8601 date-time 문자열(UTC). 화면 표시 전 로컬 포맷팅이 필요합니다. */
  moveDate: string;
  fromAddress: string;
  toAddress: string;
  status: MoveRequestStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * `POST /customers/me/move-requests` 요청 Body입니다.
 * `fromAddress`/`toAddress`는 BE 계약(`[{zonecode}] {roadAddress} {detailAddress} ({jibunAddress})`)에
 * 맞춘 하나의 문자열이어야 하며, 변환은 `move-request.utils.ts`의 `formatAddressForApi`가 담당합니다.
 */
export interface CreateMoveRequestPayload {
  serviceType: ServiceType;
  /** ISO 8601 날짜(YYYY-MM-DD), UTC 기준 오늘보다 미래. */
  moveDate: string;
  fromAddress: string;
  toAddress: string;
}

/**
 * `POST /customers/me/move-requests/:moveRequestId/designated-requests` 성공
 * `data.designatedRequest`입니다.
 */
export interface DesignatedRequestDto {
  id: string;
  moveRequestId: string;
  moverId: string;
  createdAt: string;
  updatedAt: string;
}
