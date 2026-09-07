import Image from "next/image";

import type { ReceivedRequestViewModel } from "../mover-requests.types";
import { RequestBadges, RequestSummary } from "./RequestInfo";

interface ReceivedRequestCardProps {
  request: ReceivedRequestViewModel;
  onSendQuote: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isDisabled?: boolean;
}

const CARD_BUTTON_CLASS_NAME =
  "inline-flex h-[54px] min-w-0 flex-1 items-center justify-center gap-1 rounded-xl px-6 py-4 text-[16px] font-semibold leading-[26px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-400)] disabled:cursor-not-allowed disabled:opacity-50 max-md:w-full max-md:flex-none";

export function ReceivedRequestCard({
  request,
  onSendQuote,
  onReject,
  isDisabled = false,
}: ReceivedRequestCardProps) {
  return (
    <article className="box-border flex w-full max-w-[588px] flex-col gap-8 rounded-[20px] border-[0.5px] border-[var(--line-100)] bg-[var(--gray-50)] px-10 py-8 shadow-[0_2px_10px_rgb(220_220_220/20%)] max-md:max-w-[328px] max-md:gap-6 max-md:px-5 max-md:py-6">
      <div className="flex flex-col gap-6 max-md:gap-4">
        <header className="flex min-h-[34px] items-center justify-between gap-4">
          <RequestBadges
            moveTypeLabel={request.moveTypeLabel}
            isDesignated={request.isDesignated}
          />

          <time
            className="shrink-0 text-[14px] font-normal leading-6 text-[var(--content-muted)]"
            dateTime={request.requestedAt}
          >
            {request.requestedAtLabel}
          </time>
        </header>

        <div className="border-b border-[var(--line-100)] pb-3">
          <h2 className="text-[20px] font-semibold leading-8 text-[var(--black-300)]">
            {request.customerName} 고객님
          </h2>
        </div>

        <RequestSummary request={request} variant="card" />
      </div>

      <div className="flex items-center gap-[11px] max-md:flex-col">
        <button
          type="button"
          className={`${CARD_BUTTON_CLASS_NAME} border border-[var(--primary-400)] bg-[var(--gray-50)] text-[var(--primary-400)]`}
          disabled={isDisabled}
          onClick={() => onReject(request.requestId)}
        >
          반려하기
        </button>

        <button
          type="button"
          className={`${CARD_BUTTON_CLASS_NAME} bg-[var(--primary-400)] text-[var(--gray-50)] max-md:order-first`}
          disabled={isDisabled}
          onClick={() => onSendQuote(request.requestId)}
        >
          견적 보내기
          <Image
            src="/icons/mover-request/writing.svg"
            alt=""
            width={24}
            height={24}
          />
        </button>
      </div>
    </article>
  );
}
