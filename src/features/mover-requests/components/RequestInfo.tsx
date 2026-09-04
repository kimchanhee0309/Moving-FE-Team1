import Image from "next/image";

import type { ReceivedRequestViewModel } from "../mover-requests.types";
import styles from "./MoverRequests.module.css";

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

export function RequestBadges({
  moveTypeLabel,
  isDesignated,
}: RequestBadgesProps) {
  return (
    <div className={styles.badges}>
      <span className={`${styles.badge} ${styles.moveTypeBadge}`}>
        <Image
          src="/icons/mover-request/box.svg"
          alt=""
          width={20}
          height={20}
        />
        {moveTypeLabel}
      </span>

      {isDesignated && (
        <span className={`${styles.badge} ${styles.designatedBadge}`}>
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
  const summaryClassName =
    variant === "card" ? styles.cardSummary : styles.modalSummary;

  return (
    <div className={`${styles.requestSummary} ${summaryClassName}`}>
      <div className={styles.routeGroup}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>출발지</span>
          <strong className={styles.infoValue}>{request.departureLabel}</strong>
        </div>

        <Image
          className={styles.routeArrow}
          src="/icons/mover-request/arrow-right.svg"
          alt=""
          width={18}
          height={23}
        />

        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>도착지</span>
          <strong className={styles.infoValue}>{request.arrivalLabel}</strong>
        </div>
      </div>

      <div className={`${styles.infoItem} ${styles.moveDate}`}>
        <span className={styles.infoLabel}>이사일</span>
        <time className={styles.infoValue} dateTime={request.moveDate}>
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
  return (
    <section
      className={`${styles.modalRequestHeader} ${hideMobileDivider ? styles.hideMobileDivider : ""}`}
    >
      <RequestBadges
        moveTypeLabel={request.moveTypeLabel}
        isDesignated={request.isDesignated}
      />

      <h3 className={styles.modalCustomerName}>
        {request.customerName} 고객님
      </h3>

      <RequestSummary request={request} variant="modal" />
    </section>
  );
}
