import type { ApiErrorDetail } from "./types";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: readonly ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}
