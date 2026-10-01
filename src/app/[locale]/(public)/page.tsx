import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  CompareLandingCta,
  MoveTypeCta,
  RequestLandingCta,
} from "@/features/landing/components/MoveTypeCta";

import styles from "./page.module.css";

/** Figma의 375/744/1920 랜딩 배치를 유지하고 상호작용·등장 효과만 별도 CTA로 보강합니다. */
export default function HomePage() {
  const t = useTranslations("Landing");
  const common = useTranslations("Common");
  return (
    <main className={styles.landing}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <Image className={styles.heroPhoto} src="/images/landing/hero-photo.jpeg" alt="" fill sizes="100vw" preload />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <Image className={styles.truck} src="/images/landing/truck.svg" alt="" width={160} height={100} loading="eager" />
          <h1 id="landing-title" className={`text-xl-bold ${styles.title}`}>{t("heroTitle")}</h1>
          <p className={`text-lg-regular ${styles.heroDescription}`}>
            {t("heroFirst")}<br />{t("heroSecond")}
          </p>
        </div>
      </section>

      <section className={styles.types} aria-labelledby="move-types-title">
        <h2 id="move-types-title" className={`text-xl-bold ${styles.title} ${styles.typesTitle}`}>
          {t("typesFirst")}<br />{t("typesSecond")}
        </h2>
        <MoveTypeCta />
      </section>

      <section className={styles.request} aria-labelledby="request-title">
        <div className={styles.requestCopy}>
          <h2 id="request-title" className={`text-xl-bold ${styles.title} ${styles.requestTitle}`}>
            {t("requestFirst")}<br />{t("requestSecond")}
          </h2>
          <p>{t("requestDescription")}</p>
        </div>
        <RequestLandingCta />
      </section>

      <section className={styles.compare} aria-labelledby="compare-title">
        <h2 id="compare-title" className={`text-xl-bold ${styles.title} ${styles.compareTitle}`}>
          {t("compareFirst")}<br />{t("compareSecond")}
        </h2>
        <p className={styles.compareDescription}>{t("compareDescription")}</p>
        <CompareLandingCta />
      </section>

      <section className={styles.footer} aria-label={t("footerLabel")}>
        <picture className={styles.appIcon}>
          <source media="(min-width: 744px)" srcSet="/images/landing/landing-app-icon.png" />
          <Image src="/images/landing/app-icon-mobile.svg" alt={common("brand")} width={112} height={114} />
        </picture>
        <p className={`text-lg-bold ${styles.footerText}`}>
          {t("footerFirst")}<br className={styles.mobileBreak} /> {t("footerSecond")}
        </p>
      </section>
    </main>
  );
}
