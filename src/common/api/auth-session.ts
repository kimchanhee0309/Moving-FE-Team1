import { ApiError } from "./error";

type FailureListener = (error: unknown) => void;
let generation = 0;
let pending: Promise<unknown> = Promise.resolve();
const listeners = new Set<FailureListener>();

/** 쿠키 변경만 직렬화합니다. Query 캐시와 화면 이동은 Provider가 담당합니다. */
export async function withAuthLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("moving-auth-session", operation);
  }
  const result = pending.then(operation, operation);
  pending = result.catch(() => undefined);
  return result;
}

export function getAuthGeneration(): number { return generation; }

export function assertAuthGeneration(expected: number): void {
  if (expected !== generation) {
    throw new DOMException("인증 상태가 변경되어 이전 요청을 취소했습니다.", "AbortError");
  }
}

export function subscribeAuthFailure(listener: FailureListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function invalidateAuthSession(error: unknown, expected: number): void {
  if (expected !== generation || typeof window === "undefined") return;
  generation += 1;
  listeners.forEach((listener) => listener(error));
}

/** 로그인·로그아웃 시작 전에 이전 조회/갱신의 결과를 무효화합니다. */
export async function changeAuthSession<T>(operation: () => Promise<T>): Promise<T> {
  generation += 1;
  try {
    return await withAuthLock(operation);
  } finally {
    // 쿠키 변경 도중 시작된 조회도 완료 뒤 이전 세션을 복구할 수 없습니다.
    generation += 1;
  }
}

export function isGuestFailure(error: unknown): boolean {
  return error instanceof ApiError && error.code === "REFRESH_TOKEN_MISSING";
}
