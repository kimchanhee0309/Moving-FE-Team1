import type { FavoriteListParams } from "./favorite.types";

export const favoriteKeys = {
  all: ["favorite"] as const,
  lists: () => [...favoriteKeys.all, "list"] as const,
  list: (params: FavoriteListParams) =>
    [...favoriteKeys.lists(), params] as const,
};
