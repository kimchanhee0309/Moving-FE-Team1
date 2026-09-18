import { ENV } from "@/common/constants/env";

/** 백엔드가 반환한 상대 업로드 경로를 브라우저에서 접근 가능한 API origin URL로 변환합니다. */
export function resolveApiAssetUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value, `${ENV.API_URL.replace(/\/+$/, "")}/`);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
