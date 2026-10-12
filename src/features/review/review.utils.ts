/** Figma·좁은 모달용으로 긴 광역 명칭을 짧은 표기로 바꿉니다. */
const SHORT_REGION_NAME: Readonly<Record<string, string>> = {
  서울특별시: "서울시",
  부산광역시: "부산시",
  대구광역시: "대구시",
  인천광역시: "인천시",
  광주광역시: "광주시",
  대전광역시: "대전시",
  울산광역시: "울산시",
  세종특별자치시: "세종시",
  제주특별자치도: "제주도",
  강원특별자치도: "강원도",
  전북특별자치도: "전북도",
};

function toShortRegionName(part: string): string {
  return SHORT_REGION_NAME[part] ?? part;
}

/**
 * 카드/모달 표시용으로 행정구역만 남깁니다.
 * Figma처럼 `시` 또는 `구` 단위까지만 노출하고, 특별시·광역시는 짧은 표기로 바꿉니다.
 *
 * 예:
 * - "서울특별시 강남구 로컬테스트 10-10" → "서울시 강남구"
 * - "경기도 성남시 로컬테스트 1-6" → "경기도 성남시"
 * - "경기도 성남시 분당구 정자동" → "경기도 성남시 분당구"
 */
export function toDisplayRegionAddress(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return trimmed;

  const parts = trimmed.split(/\s+/);
  // 긴 접미사부터 매칭 (특별자치시 > 시)
  const adminSuffix =
    /(?:특별자치시|특별자치도|광역시|특별시|자치시|자치도|도|시|군|구)$/;

  const regionParts: string[] = [];
  for (const part of parts) {
    if (!adminSuffix.test(part)) break;
    regionParts.push(toShortRegionName(part));
  }

  if (regionParts.length === 0) {
    // 형식을 모르면 앞 두 토큰만 사용해 과도한 노출을 막습니다.
    return parts.slice(0, 2).map(toShortRegionName).join(" ");
  }

  // 도/광역시 + 시·군 + (구) 정도까지만
  return regionParts.slice(0, 3).join(" ");
}
