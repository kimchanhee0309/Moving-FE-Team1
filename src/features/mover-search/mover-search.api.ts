import { apiClient } from "@/common/api/client";

import {
  mapMoverSearchListResult,
  toMoverSearchListQuery,
} from "./mover-search.mapper";
import type {
  MoverSearchListParams,
  MoverSearchPageResult,
} from "./mover-search.types";

/**
 * 기사님 찾기 목록 REST 호출입니다. `credentials: "include"`와 오류 변환은 공통
 * `apiClient`가 담당합니다. 추천·상세·리뷰·찜은 이 파일이 책임지지 않습니다.
 */

/** `GET /movers` — 검색·지역·서비스·정렬이 적용된 기사님 목록 한 페이지를 조회합니다. */
export async function fetchMoverSearchPage(
  params: MoverSearchListParams,
  page: number,
): Promise<MoverSearchPageResult> {
  const data = await apiClient<unknown>("/movers", {
    query: toMoverSearchListQuery(params, page),
  });

  return mapMoverSearchListResult(data);
}
