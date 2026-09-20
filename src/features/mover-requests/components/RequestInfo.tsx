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

interface RequestInfoProps {
  request: ReceivedRequestViewModel;
  hideMobileDivider?: boolean;
}

const INFO_LABEL_CLASS_NAME =
  "shrink-0 whitespace-nowrap text-[14px] font-normal leading-6 text-[var(--content-muted)]";

const CARD_INFO_VALUE_CLASS_NAME =
  "block min-w-0 max-w-full truncate text-[16px] font-semibold leading-[26px] text-[var(--black-500)]";

const MODAL_INFO_VALUE_CLASS_NAME =
  "block min-w-0 max-w-full truncate text-[16px] font-medium leading-[26px] text-[var(--black-500)] max-[743px]:text-[14px] max-[743px]:leading-6";

export function RequestBadges({
  serviceType,
  isDesignated,
}: RequestBadgesProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <MoveTypeChip variant={serviceType} />

      {isDesignated ? <MoveTypeChip variant={DESIGNATED_REQUEST_CHIP} /> : null}
    </div>
  );
}

export function RequestSummary({ request, variant }: RequestSummaryProps) {
  const isModal = variant === "modal";

  /**
   * 주소 영역과 이사일 영역을 분리합니다.
   *
   * 주소 영역은 남은 공간을 사용하고 이사일은 콘텐츠 너비를 확보하므로
   * 주소가 길어도 이사일과 겹치지 않습니다.
   */
  const summaryClassName = isModal
    ? [
        "grid grid-cols-[minmax(0,1fr)_max-content]",
        "items-end gap-x-8 gap-y-3",
        "max-[743px]:flex max-[743px]:flex-col",
        "max-[743px]:items-start max-[743px]:gap-3",
      ].join(" ")
    : [
        "grid grid-cols-[minmax(0,1fr)_max-content]",
        "items-end gap-x-6 gap-y-3",
        "max-[743px]:flex max-[743px]:flex-col",
        "max-[743px]:items-start max-[743px]:gap-3",
      ].join(" ");

  /**
   * 출발지 영역을 콘텐츠 크기만큼만 사용하게 하여 화살표가 출발지
   * 텍스트 바로 뒤에 배치되도록 합니다.
   *
   * 출발지가 너무 길면 최대 45%까지만 차지하고 말줄임 처리됩니다.
   * 도착지는 남은 공간을 모두 사용합니다.
   */
  const departureItemClassName = [
    "flex min-w-0 max-w-[45%] shrink-0 flex-col items-start",
    isModal
      ? "max-[743px]:flex-row max-[743px]:items-center max-[743px]:gap-2"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const arrivalItemClassName = [
    "flex min-w-0 flex-1 flex-col items-start",
    isModal
      ? "max-[743px]:flex-row max-[743px]:items-center max-[743px]:gap-2"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const moveDateItemClassName = [
    "flex shrink-0 flex-col items-start",
    isModal
      ? "max-[743px]:flex-row max-[743px]:items-center max-[743px]:gap-2"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const infoValueClassName = isModal
    ? MODAL_INFO_VALUE_CLASS_NAME
    : CARD_INFO_VALUE_CLASS_NAME;

  return (
    <dl className={`w-full ${summaryClassName}`} aria-label="이사 요청 정보">
      <div className="flex min-w-0 w-full items-end gap-3">
        <div className={departureItemClassName}>
          <dt className={INFO_LABEL_CLASS_NAME}>출발지</dt>

          <dd className={infoValueClassName} title={request.departureLabel}>
            {request.departureLabel}
          </dd>
        </div>

        <Image
          className="mb-0.5 h-[23px] w-[18px] shrink-0"
          src="/icons/mover-request/arrow-right.svg"
          alt=""
          width={18}
          height={23}
          aria-hidden="true"
        />

        <div className={arrivalItemClassName}>
          <dt className={INFO_LABEL_CLASS_NAME}>도착지</dt>

          <dd className={infoValueClassName} title={request.arrivalLabel}>
            {request.arrivalLabel}
          </dd>
        </div>
      </div>

      <div className={moveDateItemClassName}>
        <dt className={INFO_LABEL_CLASS_NAME}>이사일</dt>

        <dd className={infoValueClassName}>
          <time dateTime={request.moveDate}>{request.moveDateLabel}</time>
        </dd>
      </div>
    </dl>
  );
}

export function RequestInfo({
  request,
  hideMobileDivider = false,
}: RequestInfoProps) {
  const mobileDividerClassName = hideMobileDivider
    ? "max-[743px]:border-b-0 max-[743px]:pb-0"
    : "";

  return (
    <section
      className={[
        "flex flex-col gap-5",
        "border-b border-[var(--line-100)] pb-5",
        "max-[743px]:gap-4",
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
