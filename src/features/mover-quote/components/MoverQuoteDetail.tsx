"use client";

import Image from "next/image";

import { IconButton } from "@/common/components/button";
import {
  DESIGNATED_REQUEST_CHIP,
  MoveTypeChip,
} from "@/common/components/MoveTypeChip";
import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";

import { SERVICE_TYPE_LABEL } from "../mover-quote.constants";
import type { MoverQuoteDetailData } from "../mover-quote.types";

interface MoverQuoteDetailProps {
  quote: MoverQuoteDetailData;
}

export function MoverQuoteDetail({ quote }: MoverQuoteDetailProps) {
  const isConfirmed = quote.quoteStatus === QUOTE_STATUS.CONFIRMED;

  const getShareUrl = () => window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      window.alert("견적 링크가 복사되었습니다.");
    } catch {
      window.alert("링크를 복사하지 못했습니다.");
    }
  };

  const handleShareKakao = () => {
    const encodedUrl = encodeURIComponent(getShareUrl());

    window.open(
      `https://story.kakao.com/s/share?url=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareFacebook = () => {
    const encodedUrl = encodeURIComponent(getShareUrl());

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <>
      <header className="border-b border-[var(--line-100)] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-8 max-md:py-[10px]">
          <h1 className="text-[24px] font-semibold leading-8 text-[var(--black-500)] max-md:text-[18px]">
            견적 상세
          </h1>
        </div>
      </header>

      <div
        aria-hidden="true"
        className={[
          "h-[122px] w-full bg-cover bg-center",
          "bg-[url('/images/mover-quote/quote-detail-banner-mobile.svg')]",
          "min-[744px]:h-[180px]",
          "min-[744px]:bg-[url('/images/mover-quote/quote-detail-banner.svg')]",
        ].join(" ")}
      />

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0, 741px)_1fr] gap-20 px-6 py-10 max-lg:grid-cols-1 max-md:max-w-[375px] max-md:px-5 max-md:py-9">
        <section>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <MoveTypeChip variant={quote.serviceType} size="responsive" />

              {quote.isDesignated ? (
                <MoveTypeChip
                  variant={DESIGNATED_REQUEST_CHIP}
                  size="responsive"
                />
              ) : null}
            </div>

            {isConfirmed ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold leading-6 text-[var(--primary-400)]">
                <Image
                  src="/icons/ic-check-confirmed.svg"
                  alt=""
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
                확정견적
              </span>
            ) : null}
          </div>

          <h2 className="mt-6 border-b border-[var(--line-100)] pb-5 text-[20px] font-semibold leading-8 text-[var(--black-400)]">
            {quote.customerName} 고객님
          </h2>

          <div className="flex items-center justify-between gap-4 border-b border-[var(--line-100)] py-5">
            <span className="text-[18px] font-medium leading-[26px] text-[var(--black-400)]">
              견적가
            </span>

            <strong className="text-[24px] font-bold leading-8 text-[var(--black-400)]">
              {quote.price.toLocaleString("ko-KR")}원
            </strong>
          </div>

          <section className="mt-6">
            <h3 className="mb-6 text-[18px] font-semibold leading-[26px] text-[var(--black-400)]">
              견적 정보
            </h3>

            <dl className="flex flex-col gap-4 text-[16px] leading-[26px]">
              <div className="grid grid-cols-[100px_1fr] gap-6 max-md:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">
                  견적 요청일
                </dt>

                <dd className="font-medium text-[var(--black-400)]">
                  {quote.requestedAt}
                </dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-6 max-md:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">서비스</dt>

                <dd className="font-medium text-[var(--black-400)]">
                  {SERVICE_TYPE_LABEL[quote.serviceType]}
                </dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-6 max-md:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">이용일</dt>

                <dd className="font-medium text-[var(--black-400)]">
                  {quote.moveDate}
                </dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-6 max-md:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">출발지</dt>

                <dd className="font-medium text-[var(--black-400)]">
                  {quote.fromAddress}
                </dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-6 max-md:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">도착지</dt>

                <dd className="font-medium text-[var(--black-400)]">
                  {quote.toAddress}
                </dd>
              </div>
            </dl>
          </section>
        </section>

        <aside className="max-lg:border-t max-lg:border-[var(--line-100)] max-lg:pt-8">
          <h3 className="text-[18px] font-semibold leading-[26px] text-[var(--black-400)]">
            <span className="max-md:hidden">견적서 공유하기</span>

            <span className="hidden max-md:inline">
              나만 알기엔 아쉬운 기사님인가요?
            </span>
          </h3>

          <div className="mt-5 hidden items-center gap-3 min-[744px]:flex">
            <IconButton
              kind="clip"
              size="md"
              aria-label="견적 링크 복사"
              onClick={() => void handleCopyLink()}
            />

            <IconButton
              kind="kakao"
              size="md"
              aria-label="카카오톡으로 공유"
              onClick={handleShareKakao}
            />

            <IconButton
              kind="facebook"
              size="md"
              aria-label="페이스북으로 공유"
              onClick={handleShareFacebook}
            />
          </div>

          <div className="mt-5 flex items-center gap-3 min-[744px]:hidden">
            <IconButton
              kind="clip"
              size="xs"
              aria-label="견적 링크 복사"
              onClick={() => void handleCopyLink()}
            />
            <IconButton
              kind="kakao"
              size="xs"
              aria-label="카카오톡으로 공유"
              onClick={handleShareKakao}
            />
            <IconButton
              kind="facebook"
              size="xs"
              aria-label="페이스북으로 공유"
              onClick={handleShareFacebook}
            />
          </div>
        </aside>
      </main>
    </>
  );
}
