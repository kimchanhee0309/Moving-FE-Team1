/**
 * 기사님이 직접 반려한 이사 요청 한 건을 카드로 표시
 *
 * 이 카드는 REJECTED Quote가 아니라 RequestRejection 목록의 항목임
 * 카드 전체에 overlay를 표시하여 일반 보낸 견적과 구분함
 */

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
    <article className="relative min-h-[242px] w-full max-w-[588px] overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line-100)] bg-white px-10 py-8 shadow-[2px_2px_10px_rgb(220_220_220/20%)] max-[743px]:min-h-[270px] max-[743px]:max-w-[328px] max-[743px]:px-5 max-[743px]:py-6">
      <div className="flex flex-wrap items-center gap-2">
        <MoveTypeChip variant={request.serviceType} size="responsive" />

        {request.isDesignated ? (
          <MoveTypeChip variant={DESIGNATED_REQUEST_CHIP} size="responsive" />
        ) : null}
      </div>

      <h2 className="mt-6 border-b border-[var(--line-100)] pb-3 text-[20px] font-semibold leading-8 text-[var(--black-400)]">
        {request.customerName} 고객님
      </h2>

      <div className="mt-6 flex items-start justify-between gap-6 max-[743px]:flex-col max-[743px]:gap-3">
        {/*
         * 출발지 크기에 따라 화살표 위치가 자연스럽게 이동합니다.
         * 긴 주소는 최대 45%까지만 사용하고 말줄임 처리합니다.
         */}
        <div className="flex min-w-0 flex-1 items-end gap-3 max-[743px]:w-full">
          <div className="flex min-w-0 max-w-[45%] shrink-0 flex-col gap-1">
            <span className="text-[14px] leading-6 text-[var(--content-muted)]">
              출발지
            </span>

            <strong
              className="block min-w-0 max-w-full truncate text-[16px] font-semibold leading-[26px] text-[var(--black-500)]"
              title={request.fromAddress}
            >
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

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[14px] leading-6 text-[var(--content-muted)]">
              도착지
            </span>

            <strong
              className="block min-w-0 max-w-full truncate text-[16px] font-semibold leading-[26px] text-[var(--black-500)]"
              title={request.toAddress}
            >
              {request.toAddress}
            </strong>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-1">
          <span className="text-[14px] leading-6 text-[var(--content-muted)]">
            이사일
          </span>

          <strong className="whitespace-nowrap text-[16px] font-semibold leading-[26px] text-[var(--black-500)]">
            {request.moveDate}
          </strong>
        </div>
      </div>
      {/*
       * 반려 요청은 재처리 버튼을 제공하지 않으므로 overlay는 정보 전달만 담당
       * 배경 카드와 시각적으로 구분하기 위해 전체를 덮음
       */}
      <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-black/60">
        <p className="text-[18px] font-semibold leading-[26px] text-white">
          반려된 요청이에요
        </p>
      </div>
    </article>
  );
}
