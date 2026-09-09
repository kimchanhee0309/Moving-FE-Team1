import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isJusoSearchResponse, mapJusoItemToAddressResult } from "./juso-address.mapper";

const JUSO_SEARCH_URL = "https://business.juso.go.kr/addrlink/addrLinkApi.do";

/**
 * 한 번에 가져올 결과 수입니다. juso.go.kr은 동 단위 검색처럼 넓은 검색어에 수백 건이
 * 매칭될 수 있어(예: "덕산동" 758건) 전량을 다 가져오지 않고 첫 페이지만 보여줍니다.
 * `AddressSearchModal`은 "더 보기"/무한 스크롤을 지원하지 않는 단일 스크롤 목록이라,
 * 페이지네이션 UI가 추가되기 전까지는 이 값이 실질적인 결과 개수 상한입니다.
 */
const RESULTS_PER_PAGE = 20;

/**
 * 행정안전부 도로명주소 API를 서버에서만 호출하는 프록시 Route Handler입니다.
 * `JUSO_API_KEY`는 `NEXT_PUBLIC_` 접두사가 없는 서버 전용 환경변수이므로 이 파일
 * 밖(브라우저 번들)으로 절대 전달되지 않습니다. 클라이언트는 `/api/address/search?query=`만
 * 호출하고, 이 handler가 juso.go.kr 응답을 우리 프로젝트 공통 규약
 * (`{ success: true, data }` / `{ success: false, error: { code, message } }`, AGENTS.md 11번)
 * 으로 변환해 내려줍니다.
 *
 * 카카오 Local API(`/v2/local/search/address.json`)에서 이 라우트로 교체했다 — 카카오 쪽은
 * 검색어 하나를 정확한 주소 1건으로 확정하는 용도라 "동 이름만 입력해도 그 동에 속한 도로명
 * 주소가 전부 나와야 한다"는 요구를 만족하지 못했다(실제로 "역삼동"처럼 동 단위로 검색하면
 * 결과가 1~3건에 그쳤다). juso.go.kr은 정부 공식 도로명주소 원천 데이터라 동 단위 검색도
 * 페이지네이션 가능한 목록(예: "덕산동" 758건)으로 돌려준다.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";

  // 빈 검색어는 오류가 아니라 빈 결과로 처리한다 — AddressSearchModal의 hint 문구(검색어 입력 전
  // 안내)와 동작을 맞추기 위함이며, 이 경우 juso.go.kr API를 호출하지 않는다.
  if (!query) {
    return NextResponse.json({ success: true, data: [] });
  }

  const apiKey = process.env.JUSO_API_KEY;

  if (!apiKey) {
    // 키 자체는 절대 로그에 남기지 않는다. 누락 여부만 기록한다.
    console.error("[api/address/search] JUSO_API_KEY 환경변수가 설정되지 않았습니다.");
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_CONFIG_ERROR",
          message: "주소 검색 서비스를 사용할 수 없습니다.",
        },
      },
      { status: 500 },
    );
  }

  const jusoUrl = new URL(JUSO_SEARCH_URL);
  jusoUrl.searchParams.set("confmKey", apiKey);
  jusoUrl.searchParams.set("currentPage", "1");
  jusoUrl.searchParams.set("countPerPage", String(RESULTS_PER_PAGE));
  jusoUrl.searchParams.set("keyword", query);
  jusoUrl.searchParams.set("resultType", "json");

  let jusoResponse: Response;

  try {
    jusoResponse = await fetch(jusoUrl);
  } catch {
    // juso.go.kr 서버 자체에 도달하지 못한 네트워크 오류.
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "주소 검색 중 네트워크 오류가 발생했습니다.",
        },
      },
      { status: 502 },
    );
  }

  const body: unknown = await jusoResponse.json().catch(() => null);

  if (!jusoResponse.ok || !isJusoSearchResponse(body)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JUSO_RESPONSE",
          message: "주소 검색 결과를 확인할 수 없습니다.",
        },
      },
      { status: 502 },
    );
  }

  const { common, juso } = body.results;

  if (common.errorCode !== "0") {
    // 인증키 오류/쿼터 초과 등. juso.go.kr 원문 메시지나 키 정보는 클라이언트에 노출하지 않되,
    // 서버 로그에는 원인 파악을 위해 errorCode/errorMessage를 남긴다(키 값 자체는 제외).
    console.error(
      `[api/address/search] juso.go.kr 오류 (errorCode=${common.errorCode}): ${common.errorMessage}`,
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: `JUSO_${common.errorCode}`,
          message: "주소 검색에 실패했습니다. 잠시 후 다시 시도해주세요.",
        },
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    data: (juso ?? []).map(mapJusoItemToAddressResult),
  });
}
