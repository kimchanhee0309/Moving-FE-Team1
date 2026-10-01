"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { formatLongDate } from "@/common/utils/date-format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Link } from "@/i18n/navigation";

import styles from "@/app/[locale]/(public)/page.module.css";
import { resolveLandingHrefs } from "../landing.utils";

function useLandingHrefs() {
  const { user, status } = useAuth();
  const isLoading = status === "loading";
  return { ...resolveLandingHrefs(user, isLoading), isLoading };
}

const MOVE_TYPES = [
  { title: "smallMove", description: "smallDescription", imageSrc: "/images/landing/types/small-move-box.webp", imageClassName: styles.moveTypeImageSmall },
  { title: "homeMove", description: "homeDescription", imageSrc: "/images/landing/types/home-move-truck.webp", imageClassName: styles.moveTypeImageHome },
  { title: "officeMove", description: "officeDescription", imageSrc: "/images/landing/types/office-move-building.webp", imageClassName: styles.moveTypeImageOffice },
] as const;

// 랜딩 견적 비교 카드의 고정 샘플입니다. 실제 기사님·견적 데이터가 아니며 이름·주소만 locale별 문구로 바꿉니다.
const SAMPLE_QUOTES = [
  { nameKey: "sampleMoverKim", price: 180_000 },
  { nameKey: "sampleMoverLee", price: 195_000 },
  { nameKey: "sampleMoverPark", price: 210_000 },
  { nameKey: "sampleMoverChoi", price: 225_000 },
] as const;
const SAMPLE_MOVE_DATE = new Date(2026, 9, 12);

function AuthAwareLink({ href, isLoading, className, label, children }: {
  href: string | null;
  isLoading: boolean;
  className: string;
  label: string;
  children: ReactNode;
}) {
  if (isLoading || href === null) {
    return (
      <div className={className} aria-busy="true" data-navigation-pending="true">
        {children}
      </div>
    );
  }

  return (
    <Link href={href} className={className} aria-label={label}>
      {children}
    </Link>
  );
}

export function MoveTypeCta() {
  const t = useTranslations("Landing");
  const { requestHref, isLoading } = useLandingHrefs();

  return (
    <ul className={styles.moveTypeGrid} aria-label={t("moveTypes")}>
      {MOVE_TYPES.map((moveType) => (
        <li key={moveType.title}>
          <AuthAwareLink href={requestHref} isLoading={isLoading} className={styles.moveTypeCard} label={t("requestType", { type: t(moveType.title) })}>
            <Image src={moveType.imageSrc} alt="" width={1024} height={1024} sizes="(min-width: 1200px) 180px, (min-width: 744px) 150px, 92px" className={`${styles.moveTypeImage} ${moveType.imageClassName}`} />
            <h3>{t(moveType.title)}</h3>
            <p>{t(moveType.description)}</p>
          </AuthAwareLink>
        </li>
      ))}
    </ul>
  );
}

function QuotePreviewCard({ href, isLoading, index }: { href: string | null; isLoading: boolean; index: number }) {
  const t = useTranslations("Landing");
  const quote = useTranslations("Quote");
  const locale = useLocale();
  const sample = SAMPLE_QUOTES[index];
  const name = t(sample.nameKey);
  const price = quote("priceValue", { price: sample.price });

  return (
    <AuthAwareLink href={href} isLoading={isLoading} className={styles.quoteCard} label={t("quotePreview", { name, price })}>
      <div className={styles.quoteTags} aria-hidden="true"><span>{t("smallMove")}</span><span>{t("designatedQuote")}</span></div>
      <h3>{t("previewDescription")}</h3>
      <div className={styles.moverSummary}>
        <Image src="/images/gnb/icon-profile-default.svg" alt="" width={36} height={36} />
        <p><strong>{name}</strong><span>★ 5.0 · {t("experience", { years: 7 + index })}</span></p>
        <span aria-label={t("favorites", { count: 136 })}>♥ 136</span>
      </div>
      <dl className={styles.quoteRoute}>
        <div><dt>{t("from")}</dt><dd>{t("sampleFrom")}</dd></div>
        <div><dt>{t("to")}</dt><dd>{t("sampleTo")}</dd></div>
        <div><dt>{t("movingDate")}</dt><dd>{formatLongDate(SAMPLE_MOVE_DATE, locale)}</dd></div>
      </dl>
      <p className={styles.quotePrice}><span>{t("price")}</span><strong>{price}</strong></p>
      <span className={styles.cardAction} aria-hidden="true">{t("viewQuote")}</span>
    </AuthAwareLink>
  );
}

export function RequestLandingCta() {
  const t = useTranslations("Landing");
  const { requestHref, isLoading } = useLandingHrefs();

  return (
    <div className={styles.requestShowcase}>
      <AuthAwareLink href={requestHref} isLoading={isLoading} className={styles.requestCard} label={t("startRequest")}>
        <div className={styles.requestCardHeader}><Image src="/images/gnb/logo-icon.svg" alt="" width={40} height={40} /><strong>{t("movingRequest")}</strong></div>
        <div className={styles.requestProfile}>
          <Image src="/images/landing/types/small-move-box.webp" alt="" width={112} height={112} />
          <span>{t("smallMove")}</span>
          <h3>{t("tellMove")}</h3>
        </div>
        <dl className={styles.requestDetails}>
          <div><dt>{t("movingDate")}</dt><dd>2026. 10. 12.</dd></div>
          <div><dt>{t("from")}</dt><dd>{t("sampleFrom")}</dd></div>
          <div><dt>{t("to")}</dt><dd>{t("sampleTo")}</dd></div>
        </dl>
        <span className={styles.cardAction} aria-hidden="true">{t("requestQuote")}</span>
      </AuthAwareLink>
      <Image src="/images/landing/types/home-move-truck.webp" alt="" width={1024} height={1024} className={styles.requestDecoration} />
    </div>
  );
}

export function CompareLandingCta() {
  const { quoteHref, isLoading } = useLandingHrefs();
  return <div className={styles.quoteGrid}>{[0, 1, 2, 3].map((index) => <QuotePreviewCard key={index} href={quoteHref} isLoading={isLoading} index={index} />)}</div>;
}
