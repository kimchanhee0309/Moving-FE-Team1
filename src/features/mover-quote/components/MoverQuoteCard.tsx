"use client";

import Image from "next/image";

import { MOVE_REQUEST_STATUS, QUOTE_STATUS } from "@/common/constants/domain";
import {
  DESIGNATED_REQUEST_CHIP,
  MoveTypeChip,
} from "@/common/components/MoveTypeChip";
import type { MoverQuoteCardData } from "../mover-quote.types";

interface MoverQuoteCardProps {
  quote: MoverQuoteCardData;
  onDetailClick: (quoteId: string) => void;
}

export function MoverQuoteCard({ quote, onDetailClick }: MoverQuoteCardProps) {
  const isConfirmed = quote.quoteStatus === QUOTE_STATUS.CONFIRMED;

  const isCompleted = quote.moveRequestStatus === MOVE_REQUEST_STATUS.COMPLETED;

  return (
    <article className="relative min-h-[326px] overflow-hidden rounded-[20px] border border-[var(--line-100)] bg-white p-8 shadow-[2px_2px_10px_rgb(220_220_220/20%)] max-md:min-h-[284px] max-md:max-w-[328px] max-md:-p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <MoveTypeChip variant={quote.serviceType} size="responsive" />

          {quote.isDesignated ? (
            <MoveTypeChip variant={DESIGNATED_REQUEST_CHIP} size="responsive" />
          ) : null}
        </div>

        {isConfirmed ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold leading-6 text-[var(--primary-400)]">
            <Image
              src="/icons/ic-check-confirmed.svg"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            확정견적
          </span>
        ) : null}
      </div>

      <h2 className="mt-6 border-b border-[var(--line-100)] pb-3 text-[20px] font-semibold leading-8 text-[var(--black-400)]">
        {quote.customerName} 고객님
      </h2>

      <div className="mt-6 flex items-start justify-between gap-6 max-md:flex-col max-md:gap-3">
        <div className="flex min-w-0 items-end gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[14px] leading-6 text-[var(--content-muted)]">
              출발지
            </span>

            <strong className="truncate text-[16px] font-semibold leading-[26px] text-[var(--black-500)]">
              {quote.fromAddress}
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
              {quote.toAddress}
            </strong>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <span className="text-[14px] leading-6 text-[var(--content-muted)]">
            이사일
          </span>

          <strong className="text-[16px] font-semibold leading-[26px] text-[var(--black-500)]">
            {quote.moveDate}
          </strong>
        </div>
      </div>

      <div className="my-6 h-px bg-[var(--line-100)]" />

      <div className="flex items-center justify-between gap-4">
        <span className="text-[16px] font-medium leading-[26px] text-[var(--black-400)]">
          견적 금액
        </span>

        <strong className="text-[14px] font-bold leading-8 text-[var(--black-400)]">
          {quote.price.toLocaleString("ko-KR")}원
        </strong>
      </div>

      {isCompleted ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-[20px] bg-[rgb(4_4_4/64%)]">
          <p className="text-[18px] font-semibold leading-[26px] text-white">
            이사 완료된 견적이에요
          </p>

          <button
            type="button"
            className="h-12 w-44 rounded-xl border border-[var(--primary-400)] bg-white text-[14px] font-semibold leading-6 text-[var(--primary-400)] transition-colors hover:bg-[var(--primary-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => onDetailClick(quote.id)}
          >
            견적 상세보기
          </button>
        </div>
      ) : null}
    </article>
  );
}
