import type { AddressResult } from "@/common/components/AddressCard";

/**
 * 캘린더가 고른 로컬 날짜를 `moveDate` 요청 필드 형식(YYYY-MM-DD)으로 바꿉니다.
 * `Date.toISOString()`은 UTC로 변환하는 과정에서 KST 자정이 전날로 밀릴 수 있어 쓰지 않고,
 * 사용자가 실제로 고른 연/월/일 값을 그대로 사용합니다.
 */
export function formatMoveDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * 주소 검색 결과와 상세 주소를 BE `fromAddress`/`toAddress` 계약 형식으로 합칩니다.
 * 형식: `[{zonecode}] {roadAddress} {detailAddress} ({jibunAddress})`
 * (Moving BE `docs/move-request-api.md` 2번 섹션 기준)
 *
 * TODO(feature-implementer, 확인 담당: 노진우): 상세주소(동/호수) 입력칸이 아직 이 페이지에 없어
 * `detailAddress`를 항상 빈 문자열로 채운다 — Todoist "견적 요청 - 상세주소 입력칸 추가 및 주소 조합 로직"
 * 작업이 끝나면 실제 입력값을 전달하도록 호출부를 교체해야 한다. 상세주소 입력칸이 생기기 전까지만
 * 유지하고, 완료되면 이 TODO와 기본값을 제거한다.
 */
export function formatAddressForApi(address: AddressResult, detailAddress = ""): string {
  const trimmedDetail = detailAddress.trim();
  const detailSegment = trimmedDetail ? ` ${trimmedDetail}` : "";

  return `[${address.zonecode}] ${address.roadAddress}${detailSegment} (${address.jibunAddress})`;
}
