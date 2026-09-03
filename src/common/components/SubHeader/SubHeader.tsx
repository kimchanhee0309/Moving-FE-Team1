import Image from "next/image";

import type { ServiceType } from "@/common/constants/domain";
import { SERVICE_TYPE } from "@/common/constants/domain";

import styles from "./SubHeader.module.css";

const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

export interface SubHeaderProps {
  serviceType: ServiceType;
  /** Display string, e.g. "2024년 6월 24일" */
  requestedAt: string;
  from: string;
  to: string;
  /** Display string, e.g. "2024년 07월 01일 (월)" */
  moveDate: string;
  className?: string;
}

export function SubHeader({
  serviceType,
  requestedAt,
  from,
  to,
  moveDate,
  className,
}: SubHeaderProps) {
  const serviceTypeLabel = SERVICE_TYPE_LABEL[serviceType];
  const rootClassName = className
    ? `${styles.container} ${className}`
    : styles.container;

  return (
    <section className={rootClassName} aria-label="이사 정보">
      <div className={styles.content}>
        <div className={styles.titleGroup}>
          <h2 className={styles.title}>{serviceTypeLabel}</h2>
          <p className={styles.requestedAt}>견적 신청일: {requestedAt}</p>
        </div>

        <dl className={styles.meta}>
          <div className={styles.metaRow}>
            <dt className={`${styles.metaLabel} text-md-regular`}>출발지</dt>
            <dd className={`${styles.metaValue} text-md-semibold`}>{from}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={`${styles.metaLabel} text-md-regular`}>도착지</dt>
            <dd className={`${styles.metaValue} text-md-semibold`}>{to}</dd>
          </div>
          <div className={styles.metaRow}>
            <dt className={`${styles.metaLabel} text-md-regular`}>이사일</dt>
            <dd className={`${styles.metaValue} text-md-semibold`}>{moveDate}</dd>
          </div>
        </dl>

        <div className={styles.desktopMeta}>
          <div className={styles.route}>
            <div className={styles.field}>
              <span className={`${styles.metaLabel} text-md-regular`}>출발지</span>
              <span className={`${styles.fieldValue} text-2lg-semibold`}>
                {from}
              </span>
            </div>
            <div className={styles.arrow} aria-hidden="true">
              <Image
                src="/icons/arrow-right.svg"
                alt=""
                width={8}
                height={23}
                className={styles.arrowImg}
                unoptimized
              />
            </div>
            <div className={styles.field}>
              <span className={`${styles.metaLabel} text-md-regular`}>도착지</span>
              <span className={`${styles.fieldValue} text-2lg-semibold`}>
                {to}
              </span>
            </div>
          </div>

          <div className={styles.field}>
            <span className={`${styles.metaLabel} text-md-regular`}>이사일</span>
            <span className={`${styles.fieldValue} text-2lg-semibold`}>
              {moveDate}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
