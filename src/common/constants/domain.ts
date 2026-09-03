export const USER_ROLE = {
  CUSTOMER: "CUSTOMER",
  MOVER: "MOVER",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const SERVICE_TYPE = {
  SMALL: "SMALL",
  HOME: "HOME",
  OFFICE: "OFFICE",
} as const;

export type ServiceType = (typeof SERVICE_TYPE)[keyof typeof SERVICE_TYPE];

export const QUOTE_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS)[keyof typeof QUOTE_STATUS];

export const MOVE_REQUEST_STATUS = {
  WAITING: "WAITING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
} as const;

export type MoveRequestStatus =
  (typeof MOVE_REQUEST_STATUS)[keyof typeof MOVE_REQUEST_STATUS];
