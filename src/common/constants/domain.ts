/**
 * 프론트엔드 전체에서 사용하는 도메인 enum 상수
 *
 * 백엔드 Prisma/Swagger의 enum 값과 반드시 동일해야 함
 * 화면 표시용 한글 문구는 이 파일에 넣지 않고 각 feature의 label 상수에서 관리
 */

/** 사용자 역할 */
export const USER_ROLE = {
  CUSTOMER: "CUSTOMER",
  MOVER: "MOVER",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/** 제공 가능한 이사 서비스 유형 */
export const SERVICE_TYPE = {
  SMALL: "SMALL",
  HOME: "HOME",
  OFFICE: "OFFICE",
} as const;

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE];

export function isServiceType(value: unknown): value is ServiceType {
  return value === SERVICE_TYPE.SMALL || value === SERVICE_TYPE.HOME || value === SERVICE_TYPE.OFFICE;
}

export const QUOTE_STATUS = {
  PENDING: "PROPOSED",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];

/**
 * 이사 요청의 진행 상태
 *
 * WAITING: 견적을 받고 있는 상태
 * CONFIRMED: 고객이 견적을 확정한 상태
 * COMPLETED: 이사가 완료된 상태
 */
export const MOVE_REQUEST_STATUS = {
  WAITING: "WAITING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
} as const;

export type MoveRequestStatus =
  (typeof MOVE_REQUEST_STATUS)[keyof typeof MOVE_REQUEST_STATUS];
