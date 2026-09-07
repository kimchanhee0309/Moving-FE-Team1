"use client";

import Image from "next/image";

import { MOVE_REQUEST_STATUS, QUOTE_STATUS } from "@/common/constants/domain";

import type { MoverQuoteCardData } from "../mover-quote.types";

interface MoverQuoteCardProps {
  quote: MoverQuoteCardData;
  onDetailClick: (quoteId: string) => void;
}

export default function MoverQuoteCard({
  quote,
  onDetailClick,
}: MoverQuoteCardProps) {
  const isConfirmed = quote.quoteStatus === QUOTE_STATUS.CONFIRMED;

  const isCompleted = quote.moveRequestStatus === MOVE_REQUEST_STATUS.COMPLETED;

  return (
    <article className="relative min-h-[326px] overflow-hidden rounded-[20px] border border-[var(--line-100)] bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--primary-100)] px-2 py-1 text-sm font-medium text-[var(--primary-400)]">
            <Image
              src="/icons/ic-solid-box.svg"
              alt=""
              width={18}
              height={18}
            />
            소형이사
          </span>

          {quote.isDesignated && (
            <span className="inline-flex items-center gap-1 rounded-md bg-[var(--primary-100)] px-2 py-1 text-sm font-medium text-[var(--primary-400)]">
              <Image
                src="/icons/ic-solid-document.svg"
                alt=""
                width={18}
                height={18}
              />
              지정 견적 요청
            </span>
          )}
        </div>

        {isConfirmed && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary-400)]">
            <Image
              src="/icons/ic-check-confirmed.svg"
              alt=""
              width={18}
              height={18}
            />
            확정견적
          </span>
        )}
      </div>

      <h3 className="mt-7 text-xl font-semibold text-[var(--black-400)]">
        {quote.customerName} 고객님
      </h3>

      <div className="my-5 h-px bg-[var(--line-100)]" />

      <div className="grid grid-cols-[1fr_auto] gap-6">
        <div>
          <p className="text-sm text-[var(--gray-400)]">
            출발지
            <span className="ml-8">도착지</span>
          </p>

          <div className="mt-1 flex items-center gap-3 font-semibold">
            <span>{quote.fromAddress}</span>

            <Image
              src="/icons/arrow-right.svg"
              alt="에서"
              width={20}
              height={20}
            />

            <span>{quote.toAddress}</span>
          </div>
        </div>

        <div>
          <p className="text-sm text-[var(--gray-400)]">이사일</p>

          <p className="mt-1 font-semibold">{quote.moveDate}</p>
        </div>
      </div>

      <div className="my-6 h-px bg-[var(--line-100)]" />

      <div className="flex items-center justify-between">
        <span className="text-base font-medium">견적 금액</span>

        <strong className="text-2xl font-bold">
          {quote.price.toLocaleString("ko-KR")}원
        </strong>
      </div>

      {isCompleted && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 rounded-[20px] bg-black/60">
          <p className="text-lg font-semibold text-white">
            이사 완료된 견적이에요
          </p>

          <button
            type="button"
            onClick={() => onDetailClick(quote.id)}
            className="h-12 w-44 rounded-xl border border-[var(--primary-400)] bg-white text-sm font-semibold text-[var(--primary-400)] transition-colors hover:bg-[var(--primary-100)]"
          >
            견적 상세보기
          </button>
        </div>
      )}
    </article>
  );
}
