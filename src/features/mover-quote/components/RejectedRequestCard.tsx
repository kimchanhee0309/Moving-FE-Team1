import Image from "next/image";

import { SERVICE_TYPE, type ServiceType } from "@/common/constants/domain";

import type { RejectedRequestCardData } from "../mover-quote.types";

const SERVICE_LABEL: Record<ServiceType, string> = {
  [SERVICE_TYPE.SMALL]: "소형이사",
  [SERVICE_TYPE.HOME]: "가정이사",
  [SERVICE_TYPE.OFFICE]: "사무실이사",
};

interface RejectedRequestCardProps {
  request: RejectedRequestCardData;
}

export function RejectedRequestCard({ request }: RejectedRequestCardProps) {
  return (
    <article className="relative min-h-[242px] w-full max-w-[588px] overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line-100)] bg-white px-10 py-8 shadow-[2px_2px_10px_rgb(220_220_220/20%)] max-md:min-h-[270px] max-md:max-w-[328px] max-md:px-5 max-md:py-6">
      <div className="flex gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--primary-100)] px-[7px] py-1 text-[14px] font-semibold text-[var(--primary-400)]">
          <Image src="/icons/ic-solid-box.svg" alt="" width={20} height={20} />
          {SERVICE_LABEL[request.serviceType]}
        </span>

        {request.isDesignated && (
          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--secondary-red-100)] px-[7px] py-1 text-[14px] font-semibold text-[var(--secondary-red-200)]">
            <Image
              src="/icons/ic-solid-document.svg"
              alt=""
              width={20}
              height={20}
            />
            지정 견적 요청
          </span>
        )}
      </div>

      <h2 className="mt-6 border-b border-[var(--line-100)] pb-3 text-[20px] font-semibold leading-8">
        {request.customerName} 고객님
      </h2>

      <div className="mt-6 flex justify-between max-md:flex-col max-md:gap-3">
        <div>
          <p className="text-[14px] text-[var(--content-muted)]">
            출발지 도착지
          </p>

          <p className="mt-1 font-semibold">
            {request.fromAddress}
            <span className="mx-3">→</span>
            {request.toAddress}
          </p>
        </div>

        <div>
          <p className="text-[14px] text-[var(--content-muted)]">이사일</p>

          <p className="mt-1 font-semibold">{request.moveDate}</p>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-black/60">
        <p className="text-[18px] font-semibold text-white">
          반려된 요청이에요
        </p>
      </div>
    </article>
  );
}
