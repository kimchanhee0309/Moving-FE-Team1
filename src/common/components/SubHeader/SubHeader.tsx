import Image from "next/image";

import type { ServiceType } from "@/common/constants/domain";
import { SERVICE_TYPE } from "@/common/constants/domain";

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

  return (
    <section
      className={[
        "w-full bg-[var(--gray-50)] p-6 shadow-[0_8px_10px_rgba(39,39,75,0.02)]",
        "min-[744px]:px-[72px] min-[744px]:py-8",
        "min-[1200px]:px-[clamp(72px,18.75vw,360px)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="이사 정보"
    >
      <div
        className={[
          "flex w-full flex-col gap-5",
          "min-[744px]:gap-7",
          "min-[1200px]:flex-row min-[1200px]:items-end min-[1200px]:gap-5",
        ].join(" ")}
      >
        <div
          className={[
            "flex w-full flex-col",
            "min-[744px]:gap-1",
            "min-[1200px]:min-w-0 min-[1200px]:flex-1",
          ].join(" ")}
        >
          <h2 className="text-[var(--black-500)]">
            <span className="text-xl-bold min-[744px]:hidden">
              {serviceTypeLabel}
            </span>
            <span className="hidden text-2xl-bold min-[744px]:inline">
              {serviceTypeLabel}
            </span>
          </h2>
          <p className="text-[var(--gray-500)]">
            <span className="text-xs-regular min-[744px]:hidden">
              견적 신청일: {requestedAt}
            </span>
            <span className="hidden text-md-regular min-[744px]:inline">
              견적 신청일: {requestedAt}
            </span>
          </p>
        </div>

        <dl className="flex w-full flex-col gap-1 min-[744px]:hidden">
          <div className="flex w-full items-center justify-between">
            <dt className="text-md-regular whitespace-nowrap text-center text-[var(--gray-500)]">
              출발지
            </dt>
            <dd className="text-md-semibold whitespace-nowrap text-[var(--black-500)]">
              {from}
            </dd>
          </div>
          <div className="flex w-full items-center justify-between">
            <dt className="text-md-regular whitespace-nowrap text-center text-[var(--gray-500)]">
              도착지
            </dt>
            <dd className="text-md-semibold whitespace-nowrap text-[var(--black-500)]">
              {to}
            </dd>
          </div>
          <div className="flex w-full items-center justify-between">
            <dt className="text-md-regular whitespace-nowrap text-center text-[var(--gray-500)]">
              이사일
            </dt>
            <dd className="text-md-semibold whitespace-nowrap text-[var(--black-500)]">
              {moveDate}
            </dd>
          </div>
        </dl>

        <div
          className={[
            "hidden w-full items-start gap-10",
            "min-[744px]:flex",
            "min-[1200px]:w-auto min-[1200px]:shrink-0",
          ].join(" ")}
        >
          <div className="flex items-end gap-3">
            <div className="flex flex-col items-start">
              <span className="text-md-regular whitespace-nowrap text-center text-[var(--gray-500)]">
                출발지
              </span>
              <span className="text-2lg-semibold whitespace-nowrap text-[var(--black-500)]">
                {from}
              </span>
            </div>
            <div
              className="relative h-[23px] w-2 shrink-0 overflow-hidden"
              aria-hidden="true"
            >
              <Image
                src="/icons/arrow-right.svg"
                alt=""
                width={8}
                height={23}
                className="block size-full object-contain"
                unoptimized
              />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-md-regular whitespace-nowrap text-center text-[var(--gray-500)]">
                도착지
              </span>
              <span className="text-2lg-semibold whitespace-nowrap text-[var(--black-500)]">
                {to}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start">
            <span className="text-md-regular whitespace-nowrap text-center text-[var(--gray-500)]">
              이사일
            </span>
            <span className="text-2lg-semibold whitespace-nowrap text-[var(--black-500)]">
              {moveDate}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
