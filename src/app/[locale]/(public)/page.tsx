import Image from "next/image";

import {
  CompareLandingCta,
  MoveTypeCta,
  RequestLandingCta,
} from "@/features/landing/components/MoveTypeCta";

import styles from "./page.module.css";

/** Figma의 375/744/1920 랜딩 배치를 유지하고 상호작용·등장 효과만 별도 CTA로 보강합니다. */
export default function HomePage() {
  return (
    <main className={styles.landing}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <Image className={styles.heroPhoto} src="/images/landing/hero-photo.jpeg" alt="" fill sizes="100vw" preload />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <Image className={styles.truck} src="/images/landing/truck.svg" alt="" width={160} height={100} loading="eager" />
          <h1 id="landing-title" className={`text-xl-bold ${styles.title}`}>이사업체, 어떻게 고르세요?</h1>
          <p className={`text-lg-regular ${styles.heroDescription}`}>
            무빙은 여러 견적을 한눈에 비교해<br />이사업체 선정 과정을 간편하게 바꿔드려요
          </p>
        </div>
      </section>

      <section className={styles.types} aria-labelledby="move-types-title">
        <h2 id="move-types-title" className={`text-xl-bold ${styles.title} ${styles.typesTitle}`}>
          번거로운 선정과정,<br />이사 유형부터 선택해요
        </h2>
        <MoveTypeCta />
      </section>

      <section className={styles.request} aria-labelledby="request-title">
        <div className={styles.requestCopy}>
          <h2 id="request-title" className={`text-xl-bold ${styles.title} ${styles.requestTitle}`}>
            원하는 이사 서비스를 요청하고<br />견적을 받아보세요
          </h2>
          <p>이사 정보를 한 번만 입력하면 내 조건에 맞는 견적을 받을 수 있어요.</p>
        </div>
        <RequestLandingCta />
      </section>

      <section className={styles.compare} aria-labelledby="compare-title">
        <h2 id="compare-title" className={`text-xl-bold ${styles.title} ${styles.compareTitle}`}>
          여러 업체의 견적을<br />한눈에 비교하고 선택해요
        </h2>
        <p className={styles.compareDescription}>가격뿐 아니라 평점과 경력까지 살펴보고 안심할 수 있는 기사님을 선택하세요.</p>
        <CompareLandingCta />
      </section>

      <section className={styles.footer} aria-label="무빙 서비스 소개">
        <picture className={styles.appIcon}>
          <source media="(min-width: 744px)" srcSet="/images/landing/landing-app-icon.png" />
          <Image src="/images/landing/app-icon-mobile.svg" alt="무빙" width={112} height={114} />
        </picture>
        <p className={`text-lg-bold ${styles.footerText}`}>
          복잡한 이사 준비,<br className={styles.mobileBreak} /> 무빙 하나면 끝!
        </p>
      </section>
    </main>
  );
}
