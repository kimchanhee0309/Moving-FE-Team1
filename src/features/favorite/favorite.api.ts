import { apiClient } from "@/common/api/client";

import { FAVORITE_LIST_PAGE_SIZE } from "./favorite.constants";
import {
  mapFavoriteListToMovers,
  readFavoriteList,
} from "./favorite.mapper";
import type { FavoriteListParams, FavoriteMover } from "./favorite.types";

/**
 * GET /favorites — 로그인한 CUSTOMER의 찜 목록을 최신순으로 조회합니다.
 * 화면에서 pagination이 없어 pageSize 상한으로 한 번 조회합니다.
 */
export async function fetchFavoriteMovers(
  params: FavoriteListParams = {},
  signal?: AbortSignal,
): Promise<FavoriteMover[]> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? FAVORITE_LIST_PAGE_SIZE;
  const data = await apiClient<unknown>("/favorites", {
    query: { page, pageSize },
    signal,
    cache: "no-store",
  });

  return mapFavoriteListToMovers(readFavoriteList(data));
}

/**
 * DELETE /favorites/:moverId — 본인 찜만 해제합니다. 성공 시 204(Body 없음).
 */
export async function removeFavoriteMover(moverId: string): Promise<void> {
  await apiClient<null>(`/favorites/${moverId}`, { method: "DELETE" });
}
