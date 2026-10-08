import { resolveApiAssetUrl } from "@/common/api/asset-url";

import { getRegionLabel } from "./mover-search.utils";
import type { MoverDetail } from "./mover-search.types";

/**
 * `GET /movers/:id` 결과를 schema.org `MovingCompany`(LocalBusiness 하위 타입)로 변환합니다.
 * 검색엔진이 기사님 평점·서비스 지역을 리치 결과로 보여줄 수 있도록, 상세 화면에 이미 노출 중인
 * 필드만 그대로 매핑합니다. 리뷰가 없으면 `aggregateRating`은 생략합니다(0건을 평점처럼 노출하지 않음).
 * `pageUrl`은 호출부(서버 컴포넌트)가 요청 host로 만든 절대 URL입니다. 지역 label은 UI 번역과
 * 달리 항상 한국어(API 원문)로 둡니다 — 구조화 데이터는 검색엔진이 읽는 메타데이터이지 화면
 * 표시 문구가 아니라서 로케일별로 바꿀 필요가 없습니다.
 */
export function buildMoverJsonLd(
  mover: MoverDetail,
  pageUrl: string,
): Record<string, unknown> {
  const imageUrl = resolveApiAssetUrl(mover.profileImageUrl ?? null);

  return {
    "@context": "https://schema.org",
    "@type": "MovingCompany",
    "@id": pageUrl,
    url: pageUrl,
    name: mover.moverName,
    description: mover.introduction || mover.detailDescription,
    ...(imageUrl ? { image: imageUrl } : {}),
    areaServed: mover.regionValues.map((value) => ({
      "@type": "Place",
      name: getRegionLabel(value),
    })),
    ...(mover.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: mover.rating,
            reviewCount: mover.reviewCount,
          },
        }
      : {}),
  };
}

/**
 * `<script type="application/ld+json">`에 그대로 넣을 안전한 문자열을 만듭니다.
 * `</script>`로 조기 종료되지 않도록 `<`만 유니코드로 치환합니다.
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
