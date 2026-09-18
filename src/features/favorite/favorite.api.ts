import { apiClient } from "@/common/api/client";

import { FAVORITE_LIST_PAGE_SIZE } from "./favorite.constants";
import {
  mapFavoriteListToMovers,
  readFavoriteList,
} from "./favorite.mapper";
import type { FavoriteListParams, FavoriteListResult } from "./favorite.types";

/**
 * GET /favorites — 로그인한 CUSTOMER의 찜 목록을 최신순으로 조회합니다.
 * page/pageSize 기반이며, 무한 스크롤에서 pageParam으로 이어 받습니다.
 */
export async function fetchFavoriteMovers(
  params: FavoriteListParams = {},
  signal?: AbortSignal,
): Promise<FavoriteListResult> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? FAVORITE_LIST_PAGE_SIZE;
  const data = await apiClient<unknown>("/favorites", {
    query: { page, pageSize },
    signal,
    cache: "no-store",
  });

  const list = readFavoriteList(data);
  return {
    items: mapFavoriteListToMovers(list),
    pagination: list.pagination,
  };
}

/**
 * DELETE /favorites/:moverId — 본인 찜만 해제합니다. 성공 시 204(Body 없음).
 */
export async function removeFavoriteMover(moverId: string): Promise<void> {
  await apiClient<null>(`/favorites/${moverId}`, { method: "DELETE" });
}
