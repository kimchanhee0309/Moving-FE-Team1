import { headers } from "next/headers";

import { MoverSearchDetailPageContent } from "@/features/mover-search/components/MoverSearchDetailPageContent";
import { fetchMoverDetail } from "@/features/mover-search/mover-search.api";
import {
  buildMoverJsonLd,
  serializeJsonLd,
} from "@/features/mover-search/mover-search.json-ld";

interface MoverSearchDetailPageProps {
  params: Promise<{ moverId: string }>;
  searchParams: Promise<{ quote?: string | string[] }>;
}

/** 로컬 개발 서버는 http로 뜨므로 host만으로 프로토콜을 추정합니다. */
async function getRequestOrigin() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "localhost:3000";
  const protocol = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
    ? "http"
    : "https";
  return `${protocol}://${host}`;
}

export default async function MoverSearchDetailPage({
  params,
  searchParams,
}: MoverSearchDetailPageProps) {
  const { moverId } = await params;
  const query = await searchParams;
  const quoteParam = Array.isArray(query.quote) ? query.quote[0] : query.quote;

  // 서버에서 한 번만 조회해 JSON-LD를 만들고, 같은 데이터를 클라이언트 컴포넌트의
  // 초기값(initialMover)으로도 넘깁니다. 클라이언트는 이 값으로 첫 렌더 로딩 상태를
  // 건너뛰고, TanStack Query가 평소처럼 백그라운드에서 최신값을 다시 검증합니다.
  const mover = await fetchMoverDetail(moverId);
  const origin = await getRequestOrigin();
  const pageUrl = `${origin}/mover-search/${moverId}`;

  return (
    <>
      {mover ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildMoverJsonLd(mover, pageUrl)),
          }}
        />
      ) : null}
      <MoverSearchDetailPageContent
        moverId={moverId}
        mockHasGeneralQuote={quoteParam === "1"}
        initialMover={mover}
      />
    </>
  );
}
