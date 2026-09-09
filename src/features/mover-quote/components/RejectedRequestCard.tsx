import Image from "next/image";

import {
  DESIGNATED_REQUEST_CHIP,
  MoveTypeChip,
} from "@/common/components/MoveTypeChip";

import type { RejectedRequestCardData } from "../mover-quote.types";

interface RejectedRequestCardProps {
  request: RejectedRequestCardData;
}

export function RejectedRequestCard({ request }: RejectedRequestCardProps) {
  return (
    <article className="relative min-h-[242px] w-full max-w-[588px] overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line-100)] bg-white px-10 py-8 shadow-[2px_2px_10px_rgb(220_220_220/20%)] max-md:min-h-[270px] max-md:max-w-[328px] max-md:px-5 max-md:py-6">
      <div className="flex flex-wrap items-center gap-2">
        <MoveTypeChip variant={request.serviceType} size="responsive" />

        {request.isDesignated ? (
          <MoveTypeChip variant={DESIGNATED_REQUEST_CHIP} size="responsive" />
        ) : null}
      </div>

      <h2 className="mt-6 border-b border-[var(--line-100)] pb-3 text-[20px] font-semibold leading-8 text-[var(--black-400)]">
        {request.customerName} 고객님
      </h2>

      <div className="mt-6 flex items-start justify-between gap-6 max-md:flex-col max-md:gap-3">
        <div className="flex min-w-0 items-end gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[14px] leading-6 text-[var(--content-muted)]">
              출발지
            </span>

            <strong className="truncate text-[16px] font-semibold leading-[26px] text-[var(--black-500)]">
              {request.fromAddress}
            </strong>
          </div>

          <Image
            className="mb-0.5 shrink-0"
            src="/icons/arrow-right.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />

          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[14px] leading-6 text-[var(--content-muted)]">
              도착지
            </span>

            <strong className="truncate text-[16px] font-semibold leading-[26px] text-[var(--black-500)]">
              {request.toAddress}
            </strong>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <span className="text-[14px] leading-6 text-[var(--content-muted)]">
            이사일
          </span>

          <strong className="text-[16px] font-semibold leading-[26px] text-[var(--black-500)]">
            {request.moveDate}
          </strong>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-[rbg(4_4_4/64%)]">
        <p className="text-[18px] font-semibold leading-[26px] text-white">
          반려된 요청이에요
        </p>
      </div>
    </article>
  );
}
