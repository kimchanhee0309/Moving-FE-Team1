import Image from "next/image";
import { QUOTE_STATUS } from "@/common/constants/domain";
import type { MoverQuoteDetailData } from "../mover-quote.types";
interface MoverQuoteDetailProps {
  quote: MoverQuoteDetailData;
}

export function MoverQuoteDetail({ quote }: MoverQuoteDetailProps) {
  const isConfirmed = quote.quoteStatus === QUOTE_STATUS.CONFIRMED;

  return (
    <>
      <header className="border-b border-[var(--line-100)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-8 max-md:py-[10px]">
          <h1 className="text-[24px] font-semibold leading-8 max-md:text-[18px]">
            견적 상세
          </h1>
        </div>
      </header>

      <div className="relative h-[176px] overflow-hidden bg-[var(--primary-400)] max-md:h-[122px]">
        {/*
            Figma의 오렌지 배너 장식은 SVG로 export해서 
            /public/images/quote-detail-banner.svg에 넣은 후 
            이곳에서 Image로 렌더링하면 됨
        */}
      </div>

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,741px)_1fr] gap-[80px] px-6 py-10 max-lg:grid-cols-1 max-md:max-w-[375px] max-md:px-5 max-md:py-9">
        <section>
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <span className="rounded-md bg-[var(--primary-100)] px-2 py-1 text-[14px] font-semibold text-[var(--primary-400)]">
                소형이사
              </span>

              {quote.isDesignated && (
                <span className="rounded-md bg-[var(--secondary-red-100)] px-2 py-1 text-[14px] font-semibold text-[var(--secondary-red-200)]">
                  지정 견적 요청
                </span>
              )}
            </div>

            {isConfirmed && (
              <span className="flex items-center gap-1 font-bold text-[var(--primary-400)]">
                <Image
                  src="/icons/ic-check-confirmed.svg"
                  alt=""
                  width={20}
                  height={20}
                />
                확정견적
              </span>
            )}
          </div>

          <h2 className="mt-6 border-b border-[var(--line-100)] pb-5 text-[20px] font-semibold">
            {quote.customerName} 고객님
          </h2>

          <div className="flex items-center justify-between border-b border-[var(--line-100)] py-5">
            <span className="text-[18px] font-medium">견적가</span>
            <strong className="text-[24px] font-bold">
              {quote.price.toLocaleString("ko-KR")}원
            </strong>
          </div>

          <section className="mt-6">
            <h3 className="mb-6 text-[18px] font-semibold">견적 정보</h3>
            <dl className="grid grid-cols-[100px_1fr] gap-x-6 gap-y-4 text-[16px] max-md:grid-cols-[90px_1fr]">
              <dt className="text-[var(--content-placeholder)]">견적 요청일</dt>
              <dd className="font-medium">{quote.requestedAt}</dd>

              <dt className="text-[var(--content-placeholder)]">서비스</dt>
              <dd className="font-medium">사무실이사</dd>

              <dt className="text-[var(--content-placeholder)]">이용일</dt>
              <dd className="font-medium">{quote.moveDate}</dd>

              <dt className="text-[var(--content-placeholder)]">출발지</dt>
              <dd className="font-medium">{quote.fromAddress}</dd>

              <dt className="text-[var(--content-placeholder)]">도착지</dt>
              <dd className="font-medium">{quote.toAddress}</dd>
            </dl>
          </section>
        </section>

        <aside className="max-lg:border-t max-lg:border-[var(--line-100)] max-lg:pt-8">
          <h3 className="text-[18px] font-semibold">
            <span className="max-md:hidden">견적서 공유하기</span>

            <span className="hidden max-md:inline">
              나만 알기엔 아쉬운 기사님인가요?
            </span>
          </h3>

          <div className="mt-5 flex gap-3">
            {/*
              Figma에서 정확한 SVG를 export한 뒤 다음 경로로 사용:
              /icons/share/link.svg
              /icons/share/kakao.svg
              /icons/share/facebook.svg
            */}

            <button
              type="button"
              aria-label="견적 링크 복사"
              className="size-16 rounded-lg border border-[var(--line-200)] max-md:size-10"
            />

            <button
              type="button"
              aria-label="카카오톡으로 공유"
              className="size-16 rounded-lg bg-[#FAE100] max-md:size-10"
            />

            <button
              type="button"
              aria-label="페이스북으로 공유"
              className="size-16 rounded-lg bg-[var(--primary-400)] max-md:size-10"
            />
          </div>
        </aside>
      </main>
    </>
  );
}
