export const customerQuoteQueryKeys = {
  all: ["customer-quote"] as const,
  pendingList: () => [...customerQuoteQueryKeys.all, "pending-list"] as const,
  pendingDetail: (quoteId: string) =>
    [...customerQuoteQueryKeys.all, "pending-detail", quoteId] as const,
  historyList: () => [...customerQuoteQueryKeys.all, "history-list"] as const,
  historyDetail: (quoteId: string) =>
    [...customerQuoteQueryKeys.all, "history-detail", quoteId] as const,
  activeMoveRequest: () =>
    [...customerQuoteQueryKeys.all, "active-move-request"] as const,
};
