import { ApiError } from "./error";

/** 기능별 오류 문구를 유지하면서 unknown API 응답을 일관되게 검증합니다. */
export function createApiResponseReader(errorMessage: string) {
  const invalid = (): never => {
    throw new ApiError(200, "INVALID_RESPONSE", errorMessage);
  };

  return {
    invalid,
    isRecord(value: unknown): value is Record<string, unknown> {
      return typeof value === "object" && value !== null && !Array.isArray(value);
    },
    string(value: unknown): string {
      if (typeof value !== "string") return invalid();
      return value;
    },
    nullableString(value: unknown): string | null {
      if (value !== null && typeof value !== "string") return invalid();
      return value;
    },
    number(value: unknown): number {
      if (typeof value !== "number" || !Number.isFinite(value)) return invalid();
      return value;
    },
    stringArray(value: unknown): string[] {
      if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) return invalid();
      return value;
    },
  };
}
