import { Button } from "@/common/components/button";

import type { ReceivedRequestViewModel } from "../mover-requests.types";
import { RequestBadges, RequestSummary } from "./RequestInfo";

interface ReceivedRequestCardProps {
  request: ReceivedRequestViewModel;
  onSendQuote: (requestId: string) => void;
  onReject: (requestId: string) => void;
  isDisabled?: boolean;
}

export function ReceivedRequestCard({
  request,
  onSendQuote,
  onReject,
  isDisabled = false,
}: ReceivedRequestCardProps) {
  return (
    <article className="box-border flex w-full max-w-[588px] flex-col gap-8 rounded-[20px] border-[0.5px] border-[var(--line-100)] bg-[var(--gray-50)] px-10 py-8 shadow-[0_2px_10px_rgb(220_220_220_/20%)] max-[743px]:max-w-[328px] max-[743px]:px-5 max-[743px]:py-6">
      <div className="flex flex-col gap-6 max-[743px]:gap-4">
        <header className="flex min-h-[34px] items-center justify-between gap-4">
          <RequestBadges
            serviceType={request.serviceType}
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

      <div className="grid w-full grid-cols-2 gap-[11px] max-[743px]:grid-cols-1">
        <Button
          type="button"
          size="sm"
          variant="outlined"
          fullWidth
          disabled={isDisabled}
          className="!border-[var(--primary-400)] !text-[var(--primary-400)]"
          onClick={() => onReject(request.requestId)}
        >
          반려하기
        </Button>

        <Button
          type="button"
          size="sm"
          fullWidth
          withWritingIcon
          disabled={isDisabled}
          className="max-[743px]:order-first"
          onClick={() => onSendQuote(request.requestId)}
        >
          견적 보내기
        </Button>
      </div>
    </article>
  );
}
