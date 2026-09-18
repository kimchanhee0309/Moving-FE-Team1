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
   * 주소 영역과 이사일 영역을 각각 별도의 grid column으로 배치합니다.
   *
   * 주소 영역은 남은 공간만 사용하고 이사일은 실제 콘텐츠 너비를
   * 확보하므로, 주소가 길어도 이사일 영역을 침범하지 않습니다.
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
   * 출발지와 도착지는 고정 너비를 사용하지 않습니다.
   *
   * 두 주소가 사용 가능한 공간을 동일하게 나눠 가지고,
   * 공간이 부족한 경우 각 주소에서 말줄임 처리됩니다.
   */
  const routeGroupClassName = [
    "grid min-w-0 w-full",
    "grid-cols-[minmax(0,1fr)_18px_minmax(0,1fr)]",
    "items-end gap-3",
  ].join(" ");

  const infoItemClassName = isModal
    ? [
        "flex min-w-0 flex-col items-start",
        "max-[743px]:flex-row max-[743px]:items-center max-[743px]:gap-2",
      ].join(" ")
    : "flex min-w-0 flex-col items-start";

  const moveDateItemClassName = [infoItemClassName, "shrink-0"].join(" ");

  const infoValueClassName = isModal
    ? MODAL_INFO_VALUE_CLASS_NAME
    : CARD_INFO_VALUE_CLASS_NAME;

  return (
    <dl className={`w-full ${summaryClassName}`} aria-label="이사 요청 정보">
      <div className={routeGroupClassName}>
        <div className={infoItemClassName}>
          <dt className={INFO_LABEL_CLASS_NAME}>출발지</dt>

          <dd className={infoValueClassName} title={request.departureLabel}>
            {request.departureLabel}
          </dd>
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
