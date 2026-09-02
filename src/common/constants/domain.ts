export const USER_ROLE = {
  CUSTOMER: "CUSTOMER",
  MOVER: "MOVER",
} as const;

export const SERVICE_TYPE = {
  SMALL: "SMALL",
  HOME: "HOME",
  OFFICE: "OFFICE",
} as const;

export const QUOTE_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  REJECTED: "REJECTED",
} as const;

export const MOVE_REQUEST_STATUS = {
  WAITING: "WAITING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
} as const;
