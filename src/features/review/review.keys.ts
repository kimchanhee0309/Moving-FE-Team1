import type { CustomerReviewListParams } from "./review.types";

export const reviewKeys = {
  all: ["review"] as const,
  customerLists: () => [...reviewKeys.all, "customer"] as const,
  customerList: (params: CustomerReviewListParams) =>
    [...reviewKeys.customerLists(), params] as const,
};
