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
 * `zonecode`/`jibunAddress`가 비어 있으면 그 대괄호/괄호 자체를 생략한다 — 그렇지 않으면
 * `parseAddressFromApi`가 옛날 형식(대괄호/괄호 없는 순수 텍스트) 주소를 역파싱할 때 채워 넣는
 * 빈 문자열이 "수정하기"로 재제출될 때 `[] 서울특별시 ... ()`처럼 빈 대괄호/괄호가 그대로 화면에
 * 노출되는 문제가 있었다(실제 seed 데이터로 재현·확인함).
 *
 * TODO(feature-implementer, 확인 담당: 노진우): 상세주소(동/호수) 입력칸이 아직 이 페이지에 없어
 * `detailAddress`를 항상 빈 문자열로 채운다 — Todoist "견적 요청 - 상세주소 입력칸 추가 및 주소 조합 로직"
 * 작업이 끝나면 실제 입력값을 전달하도록 호출부를 교체해야 한다. 상세주소 입력칸이 생기기 전까지만
 * 유지하고, 완료되면 이 TODO와 기본값을 제거한다.
 */
export function formatAddressForApi(address: AddressResult, detailAddress = ""): string {
  const trimmedDetail = detailAddress.trim();
  const detailSegment = trimmedDetail ? ` ${trimmedDetail}` : "";
  const zonecodeSegment = address.zonecode ? `[${address.zonecode}] ` : "";
  const jibunSegment = address.jibunAddress ? ` (${address.jibunAddress})` : "";

  return `${zonecodeSegment}${address.roadAddress}${detailSegment}${jibunSegment}`;
}

/**
 * `이사 예정일` 표시용 날짜 문자열을 만든다("2025년 7월 1일"). 원래 `page.tsx`(`MoveRequestForm`)
 * 안에만 있던 로컬 함수였는데, 활성 요청 카드(`MoveRequestBlockedState`)에서도 같은 형식으로
 * `moveDate`를 보여줘야 해서 공용 유틸로 옮겼다 — 서버 전송용 직렬화(`formatMoveDateForApi`)와는
 * 별개이며 화면 표시 전용이다.
 */
export function formatMoveDateLabel(date: Date): string {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

/**
 * BE(`move-request.service.ts`)는 `moveDate`가 오늘보다 미래일 때만 생성·수정을 허용한다.
 * "수정하기"로 기존 요청을 열면 예전에 고른 `moveDate`가 그대로 채워지는데, 시간이 지나
 * 그 날짜가 이미 오늘이거나 지나버렸을 수 있다 — 이 경우 사용자가 다른 값을 하나도 안 바꿔도
 * 그대로 제출하면 BE가 400(VALIDATION_ERROR)으로 거절한다(실제로 재현·확인함). 그래서 폼의
 * 제출 가능 여부를 계산할 때 `moveDate`가 채워져 있다는 것뿐 아니라 여전히 미래인지도 같이
 * 확인해야 한다 — `MoveDateCalendar`가 오늘/과거를 비활성화하는 기준(로컬 자정)과 동일하게 맞춘다.
 */
export function isPastOrTodayMoveDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  return target.getTime() <= today.getTime();
}

/**
 * `formatAddressForApi`의 역변환입니다. BE가 내려주는 `MoveRequestDto.fromAddress`/`toAddress`
 * (`[{zonecode}] {roadAddress} {detailAddress} ({jibunAddress})`)를 다시 `AddressResult`로 쪼갠다 —
 * "수정하기"로 생성 wizard를 다시 열 때 출발지/도착지 검색 모달(`AddressSearchModal`)에 기존
 * 선택 상태를 넘겨주기 위해서만 쓴다.
 *
 * TODO(feature-implementer, 확인 담당: 노진우): 상세주소(`detailAddress`) 입력칸이 아직 없어
 * `formatAddressForApi`가 항상 빈 문자열을 채우는 전제로 만든 파서라, `roadAddress`와
 * `detailAddress`를 구분하지 못하고 괄호 앞부분을 통째로 `roadAddress`에 담는다. 상세주소
 * 입력칸이 생기면(Todoist "견적 요청 - 상세주소 입력칸 추가" 작업) 이 파서도 함께 갱신해야 한다.
 * 형식이 예상과 다르면(정규식 매치 실패) 원본 문자열을 그대로 `roadAddress`에 넣어 화면이
 * 깨지지 않게만 한다.
 */
const ADDRESS_API_FORMAT = /^\[(.+)\]\s(.+)\s\((.+)\)$/;

export function parseAddressFromApi(formattedAddress: string): AddressResult {
  const match = formattedAddress.match(ADDRESS_API_FORMAT);

  if (!match) {
    return { zonecode: "", roadAddress: formattedAddress, jibunAddress: "" };
  }

  const [, zonecode, roadAddress, jibunAddress] = match;
  return { zonecode, roadAddress, jibunAddress };
}
