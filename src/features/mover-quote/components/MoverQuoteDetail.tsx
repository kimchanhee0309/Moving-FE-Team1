/**
 * 기사님이 보낸 견적의 상세 정보를 표시합니다.
 *
 * 이 컴포넌트는 이미 검증·변환된 ViewModel을 받아 렌더링만 담당합니다.
 * 데이터 조회와 오류 처리는 MoverQuoteDetailView가 담당합니다.
 */

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import {
  DESIGNATED_REQUEST_CHIP,
  MoveTypeChip,
} from "@/common/components/MoveTypeChip";
import { QUOTE_STATUS } from "@/common/constants/domain";
import { formatDateWithWeekday, SERVICE_TIME_ZONE } from "@/common/utils/date-format";

import type { MoverQuoteDetailData } from "../mover-quote.types";
import { QuoteShareButtons } from "./QuoteShareButtons";

interface MoverQuoteDetailProps {
  quote: MoverQuoteDetailData;
}

export function MoverQuoteDetail({ quote }: MoverQuoteDetailProps) {
  const t = useTranslations("MoverQuote");
  const quoteText = useTranslations("Quote");
  const moveType = useTranslations("MoveType");
  const locale = useLocale();
  const isConfirmed = quote.quoteStatus === QUOTE_STATUS.CONFIRMED;

  const priceLabel =
    quote.price === null
      ? quoteText("noPrice")
      : quoteText("priceValue", { price: quote.price });

  return (
    <>
      <header className="border-b border-[var(--line-100)] bg-white">
        {/*
          컨테이너 폭·padding은 GNB(`Gnb.tsx`)의 `max-w-[1920px]` + `px-6/px-18/px-40` 기준과
          맞춘다 — 예전엔 `max-w-[1200px]`+고정 `px-6`이라 1200px 이상 화면에서 GNB 로고와 이
          제목의 중앙정렬 기준 폭이 달라 화면이 커질수록 간격이 계속 벌어졌다.
        */}
        <div className="mx-auto max-w-[1920px] px-6 py-8 min-[744px]:px-18 min-[1200px]:px-40 max-[743px]:py-[10px]">
          <h1 className="text-[24px] font-semibold leading-8 text-[var(--black-500)] max-[743px]:text-[18px]">
            {quoteText("detailTitle")}
          </h1>
        </div>
      </header>

      {/*
       * 배너는 의미 있는 정보를 전달하지 않는 장식 이미지이므로
       * background-image와 aria-hidden을 사용합니다.
       */}
      <div
        aria-hidden="true"
        className={[
          "h-[122px] w-full bg-cover bg-center",
          "bg-[url('/images/mover-quote/quote-detail-banner-mobile.svg')]",
          "min-[744px]:h-[180px]",
          "min-[744px]:bg-[url('/images/mover-quote/quote-detail-banner.svg')]",
        ].join(" ")}
      />

      <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-20 px-6 py-10 min-[1200px]:grid-cols-[minmax(0,741px)_1fr] max-[743px]:max-w-[375px] max-[743px]:px-5 max-[743px]:py-9">
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
                {quoteText("confirmed")}
              </span>
            ) : null}
          </div>

          <h2 className="mt-6 border-b border-[var(--line-100)] pb-5 text-[20px] font-semibold leading-8 text-[var(--black-400)]">
            {quoteText("customerName", { name: quote.customerName })}
          </h2>

          <div className="flex items-center justify-between gap-4 border-b border-[var(--line-100)] py-5">
            <span className="text-[18px] font-medium leading-[26px] text-[var(--black-400)]">
              {quoteText("priceTitle")}
            </span>

            <strong className="text-[24px] font-bold leading-8 text-[var(--black-400)]">
              {priceLabel}
            </strong>
          </div>

          <section className="mt-6">
            <h3 className="mb-6 text-[18px] font-semibold leading-[26px] text-[var(--black-400)]">
              {quoteText("info")}
            </h3>

            <dl className="flex flex-col gap-4 text-[16px] leading-[26px]">
              <div className="grid grid-cols-[100px_1fr] gap-6 max-[743px]:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">
                  {quoteText("requestedAt")}
                </dt>

                <dd className="font-medium text-[var(--black-400)]">
                  {quote.requestedAt}
                </dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-6 max-[743px]:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">{quoteText("service")}</dt>

                <dd className="font-medium text-[var(--black-400)]">
                  {moveType(quote.serviceType)}
                </dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-6 max-[743px]:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">{quoteText("useDate")}</dt>

                <dd className="font-medium text-[var(--black-400)]">
                  {formatDateWithWeekday(quote.moveDate, locale, SERVICE_TIME_ZONE)}
                </dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-6 max-[743px]:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">{quoteText("from")}</dt>

                <dd className="break-keep font-medium text-[var(--black-400)]">
                  {quote.fromAddress}
                </dd>
              </div>

              <div className="grid grid-cols-[100px_1fr] gap-6 max-[743px]:grid-cols-[90px_1fr]">
                <dt className="text-[var(--content-placeholder)]">{quoteText("to")}</dt>

                <dd className="break-keep font-medium text-[var(--black-400)]">
                  {quote.toAddress}
                </dd>
              </div>
            </dl>
          </section>
        </section>

        <aside className="border-t border-[var(--line-100)] pt-8 min-[1200px]:border-t-0 min-[1200px]:pt-0">
          <h3 className="text-[18px] font-semibold leading-[26px] text-[var(--black-400)]">
            <span className="max-[743px]:hidden">{quoteText("share")}</span>

            <span className="hidden max-[743px]:inline">
              {t("shareMobile")}
            </span>
          </h3>

          <QuoteShareButtons />
        </aside>
      </main>
    </>
  );
}
