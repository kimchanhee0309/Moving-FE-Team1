import Image from "next/image";

import {
  DESIGNATED_REQUEST_CHIP,
  MoveTypeChip,
} from "@/common/components/MoveTypeChip";

import type { ServiceType } from "@/common/constants/domain";

import type { ReceivedRequestViewModel } from "../mover-requests.types";

interface RequestBadgesProps {
  serviceType: ServiceType;
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

const INFO_LABEL_CLASS_NAME =
  "whitespace-nowrap text-[14px] font-normal leading-6 text-[var(--content-muted)]";

const CARD_INFO_VALUE_CLASS_NAME =
  "whitespace-nowrap text-[16px] font-semibold leading-[26px] text-[var(--black-500)]";

const MODAL_INFO_VALUE_CLASS_NAME =
  "whitespace-nowrap text-[16px] font-medium leading-[26px] text-[var(--black-500)] max-md:text-[14px] max-md:leading-6";

export function RequestBadges({
  serviceType,
  isDesignated,
}: RequestBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <MoveTypeChip variant={serviceType} />

      {isDesignated && <MoveTypeChip variant={DESIGNATED_REQUEST_CHIP} />}
    </div>
  );
}

export function RequestSummary({ request, variant }: RequestSummaryProps) {
  const isModal = variant === "modal";

  const summaryClassName = isModal
    ? "gap-12 max-md:flex-col max-md:gap-2"
    : "justify-between gap-6 max-md:flex-col max-md:gap-3";

  const routeGroupClassName = isModal
    ? "flex w-[201px] shrink-0 items-end gap-3 max-md:w-full max-md:items-center"
    : "flex w-[201px] shrink-0 items-end gap-3";

  const infoItemClassName = isModal
    ? "flex flex-col items-start max-md:flex-row max-md:items-center max-md:gap-2"
    : "flex flex-col items-start";

  const infoValueClassName = isModal
    ? MODAL_INFO_VALUE_CLASS_NAME
    : CARD_INFO_VALUE_CLASS_NAME;

  return (
    <dl
      className={`flex w-full items-start ${summaryClassName}`}
      aria-label="이사 요청 정보"
    >
      <div className={routeGroupClassName}>
        <div className={infoItemClassName}>
          <dt className={INFO_LABEL_CLASS_NAME}>출발지</dt>

          <dd className={infoValueClassName}>{request.departureLabel}</dd>
        </div>

        <Image
          className="h-[23px] w-[18px] shrink-0"
          src="/icons/mover-request/arrow-right.svg"
          alt=""
          width={18}
          height={23}
          aria-hidden="true"
        />

        <div className={infoItemClassName}>
          <dt className={INFO_LABEL_CLASS_NAME}>도착지</dt>

          <dd className={infoValueClassName}>{request.arrivalLabel}</dd>
        </div>
      </div>

      <div className={infoItemClassName}>
        <dt className={INFO_LABEL_CLASS_NAME}>이사일</dt>

        <dd className={infoValueClassName}>
          <time dateTime={request.moveDate}>{request.moveDateLabel}</time>
        </dd>
      </div>
    </dl>
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
      className={[
        "flex flex-col gap-5",
        "border-b border-[var(--line-100)] pb-5",
        "max-md:gap-4",
        mobileDividerClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${request.customerName} 고객님의 이사 요청`}
    >
      <RequestBadges
        serviceType={request.serviceType}
        isDesignated={request.isDesignated}
      />

      <h3 className="text-[20px] font-semibold leading-8 text-[var(--black-300)]">
        {request.customerName} 고객님
      </h3>

      <RequestSummary request={request} variant="modal" />
    </section>
  );
}
