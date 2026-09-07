import Image from "next/image";

import type { ReceivedRequestViewModel } from "../mover-requests.types";

interface RequestBadgesProps {
  moveTypeLabel: string;
  isDesignated: boolean;
}

interface RequestSummaryProps {
  request: ReceivedRequestViewModel;
  variant: "card" | "modal";
}

interface RequestModalSummaryProps {
  request: ReceivedRequestViewModel;
  hideMobileDivider?: boolean;
}

const BADGE_CLASS_NAME =
  "inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md px-[7px] py-1 pl-[5px] text-[14px] font-semibold leading-6 shadow-[4px_4px_4px_rgb(217_217_217/10%)] max-md:gap-0.5 max-md:rounded-sm max-md:py-0.5 max-md:pl-1 max-md:text-[13px] max-md:leading-[22px]";

export function RequestBadges({
  moveTypeLabel,
  isDesignated,
}: RequestBadgesProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`${BADGE_CLASS_NAME} bg-[var(--primary-100)] text-[var(--primary-400)]`}
      >
        <Image
          src="/icons/mover-request/box.svg"
          alt=""
          width={20}
          height={20}
        />

        {moveTypeLabel}
      </span>

      {isDesignated && (
        <span
          className={`${BADGE_CLASS_NAME} bg-[var(--secondary-red-100)] text-[var(--secondary-red-200)]`}
        >
          <Image
            src="/icons/mover-request/document.svg"
            alt=""
            width={20}
            height={20}
          />
          지정 견적 요청
        </span>
      )}
    </div>
  );
}

export function RequestSummary({ request, variant }: RequestSummaryProps) {
  const isModal = variant === "modal";

  const summaryClassName = isModal
    ? "gap-12 max-md:flex-col max-md:gap-2"
    : "justify-between max-md:flex-col max-md:gap-3";

  const routeGroupClassName = isModal
    ? "flex w-[201px] shrink-0 items-end gap-3 max-md:w-[271px] max-md:items-center"
    : "flex w-[201px] shrink-0 items-end gap-3";

  const infoItemClassName = isModal
    ? "flex flex-col items-start max-md:flex-row max-md:items-center max-md:gap-2"
    : "flex flex-col items-start";

  const infoValueClassName = isModal
    ? "whitespace-nowrap text-[16px] font-medium leading-[26px] text-[var(--black-500)] max-md:text-[14px] max-md:leading-6"
    : "whitespace-nowrap text-[16px] font-semibold leading-[26px] text-[var(--black-500)]";

  return (
    <div className={`flex w-full items-start ${summaryClassName}`}>
      <div className={routeGroupClassName}>
        <div className={infoItemClassName}>
          <span className="whitespace-nowrap text-[14px] font-normal leading-6 text-[var(--content-muted)]">
            출발지
          </span>

          <strong className={infoValueClassName}>
            {request.departureLabel}
          </strong>
        </div>

        <Image
          className="h-[23px] w-[18px] shrink-0"
          src="/icons/mover-request/arrow-right.svg"
          alt=""
          width={18}
          height={23}
        />

        <div className={infoItemClassName}>
          <span className="whitespace-nowrap text-[14px] font-normal leading-6 text-[var(--content-muted)]">
            도착지
          </span>

          <strong className={infoValueClassName}>{request.arrivalLabel}</strong>
        </div>
      </div>

      <div className={infoItemClassName}>
        <span className="whitespace-nowrap text-[14px] font-normal leading-6 text-[var(--content-muted)]">
          이사일
        </span>

        <time className={infoValueClassName} dateTime={request.moveDate}>
          {request.moveDateLabel}
        </time>
      </div>
    </div>
  );
}

export function RequestModalSummary({
  request,
  hideMobileDivider = false,
}: RequestModalSummaryProps) {
  const mobileDividerClassName = hideMobileDivider
    ? "max-md:border-b-0 max-md:pb-0"
    : "";

  return (
    <section
      className={`flex flex-col gap-5 border-b border-[var(--line-100)] pb-5 max-md:gap-4 ${mobileDividerClassName}`}
    >
      <RequestBadges
        moveTypeLabel={request.moveTypeLabel}
        isDesignated={request.isDesignated}
      />

      <h3 className="text-[20px] font-semibold leading-8 text-[var(--black-300)]">
        {request.customerName} 고객님
      </h3>

      <RequestSummary request={request} variant="modal" />
    </section>
  );
}
