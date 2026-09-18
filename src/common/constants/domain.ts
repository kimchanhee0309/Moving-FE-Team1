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

/** 견적 상태
 *
 * PROPOSED: 기사님이 견적을 보냈지만 고객이 아직 선택하지 않은 상태
 * CONFIRMED: 고객이 해당 견적을 선택한 상태
 * REJECTED: 거절 처리된 기존 견적 데이터 상태
 *
 * 기사님의 요청 반려는 Quote.REJECTED가 아니라 RequestRejection으로 별도 관리
 */
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
