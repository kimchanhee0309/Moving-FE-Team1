import Image from "next/image";

import styles from "./page.module.css";

/** Figma의 화면별 일러스트를 재사용하며 랜딩 전용 UI는 팀 리뷰 기준에 따라 page에 둡니다. */
export default function HomePage() {
  return (
    <main className={styles.landing}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <Image className={styles.heroPhoto} src="/images/landing/hero-photo.jpeg" alt="" fill sizes="100vw" priority />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroContent}>
          <Image className={styles.truck} src="/images/landing/truck.svg" alt="" width={160} height={100} priority />
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
        <picture className={styles.typesImage}>
          <source media="(min-width: 1200px)" srcSet="/images/landing/types-desktop.png" />
          <source media="(min-width: 744px)" srcSet="/images/landing/types-tablet.png" />
          <Image src="/images/landing/types-mobile.png" alt="소형이사, 가정이사, 기업·사무실 이사 중 필요한 유형을 선택할 수 있습니다." width={750} height={324} sizes="(min-width: 1200px) 693px, (min-width: 744px) 677px, 100vw" />
        </picture>
      </section>

      <section className={styles.request} aria-labelledby="request-title">
        <picture className={styles.requestImage}>
          <source media="(min-width: 1200px)" srcSet="/images/landing/request-desktop.png" />
          <source media="(min-width: 744px)" srcSet="/images/landing/request-tablet.png" />
          <Image src="/images/landing/request-mobile-frame.png" alt="이사 정보와 서비스 내용을 확인하는 견적 요청 화면 예시" width={375} height={496} sizes="(min-width: 1200px) 1402px, (min-width: 744px) 680px, 100vw" />
        </picture>
        <h2 id="request-title" className={`text-xl-bold ${styles.title} ${styles.requestTitle}`}>
          원하는 이사 서비스를 요청하고<br />견적을 받아보세요
        </h2>
      </section>

      <section className={styles.compare} aria-labelledby="compare-title">
        <picture className={styles.compareImage}>
          <source media="(min-width: 1200px)" srcSet="/images/landing/landing-compare.png" />
          <source media="(min-width: 744px)" srcSet="/images/landing/compare-tablet.png" />
          <Image src="/images/landing/compare-mobile.png" alt="여러 기사님의 평점, 경력과 견적 금액을 비교하는 화면 예시" width={750} height={2152} sizes="100vw" />
        </picture>
        <h2 id="compare-title" className={`text-xl-bold ${styles.title} ${styles.compareTitle}`}>
          여러 업체의 견적을<br />한눈에 비교하고 선택해요
        </h2>
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
