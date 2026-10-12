/**
 * 여러 feature에서 함께 무효화해야 하는 TanStack Query 최상위 Key
 *
 * 예를 들어 받은 요청에서 견적을 보내면:
 * 1. 받은 요청 목록에서 해당 요청이 사라져야 하고
 * 2. 보낸 견적 목록에는 새 견적이 나타나야 함
 *
 * feature끼리 서로의 hook을 직접 import하지 않도록 공통 root key만 이곳에서 관리
 */
export const QUERY_KEY_ROOTS = {
  /** 기사님이 아직 처리하지 않은 받은 요청 목록 */
  MOVER_RECEIVED_REQUESTS: ["mover", "received-requests"] as const,

  /** 기사님이 보낸 견적 목록 및 견적 상세 */
  MOVER_QUOTES: ["mover", "quotes"] as const,

  /** 기사님이 직접 반려한 요청 목록 */
  MOVER_REJECTED_REQUESTS: ["mover", "rejected-requests"] as const,
} as const;
