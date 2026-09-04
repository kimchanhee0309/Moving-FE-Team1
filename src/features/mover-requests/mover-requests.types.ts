export interface ReceivedRequestViewModel {
  requestId: string;
  customerName: string;
  moveTypeLabel: string;
  isDesignated: boolean;
  requestedAt: string;
  requestedAtLabel: string;
  departureLabel: string;
  arrivalLabel: string;
  moveDate: string;
  moveDateLabel: string;
}

export interface SendQuoteFormValue {
  price: number;
  comment: string;
}

export interface RejectRequestFormValue {
  reason: string;
}
