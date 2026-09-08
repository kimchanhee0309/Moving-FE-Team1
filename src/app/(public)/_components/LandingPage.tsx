import Image from "next/image";

import styles from "./LandingPage.module.css";

/**
 * Figma 랜딩(1:6566, 720:41141)의 소개 문구는 HTML로, 서비스 예시는 원본 일러스트로 표시합니다.
 * 예시 견적 이미지는 실제 기사/가격 데이터가 아니며 API·로그인 상태를 소유하지 않습니다.
 */
export function LandingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <Image className={styles.heroBackground} src="/images/landing/hero-photo.jpeg" alt="" fill sizes="100vw" priority />
        <div className={styles.heroContent}>
          <Image className={styles.truck} src="/images/landing/truck.svg" alt="" width={160} height={100} priority />
          <h1 id="landing-title">이사업체, 어떻게 고르세요?</h1>
          <p>무빙은 여러 견적을 한눈에 비교해<br />이사업체 선정 과정을 간편하게 바꿔드려요</p>
        </div>
      </section>

      <section className={styles.types} aria-labelledby="move-types-title">
        <h2 id="move-types-title">번거로운 선정과정,<br />이사 유형부터 선택해요</h2>
        <picture>
          <source media="(max-width: 743px)" srcSet="/images/landing/types-mobile.png" />
          <Image src="/images/landing/types-mobile.png" alt="소형이사, 가정이사, 기업·사무실 이사 중 필요한 유형을 선택할 수 있습니다." width={750} height={324} />
        </picture>
      </section>

      <section className={styles.request} aria-labelledby="request-title">
        <picture>
          <source media="(max-width: 743px)" srcSet="/images/landing/request-mobile.png" />
          <Image src="/images/landing/request-desktop.png" alt="이사 정보와 서비스 내용을 확인하는 견적 요청 화면 예시" width={1402} height={787} />
        </picture>
        <h2 id="request-title">원하는 이사 서비스를 요청하고<br />견적을 받아보세요</h2>
      </section>

      <section className={styles.compare} aria-labelledby="compare-title">
        <picture>
          <source media="(max-width: 743px)" srcSet="/images/landing/compare-mobile.png" />
          <Image src="/images/landing/landing-compare.png" alt="여러 기사님의 평점, 경력과 견적 금액을 비교하는 화면 예시" width={1920} height={1081} />
        </picture>
        <h2 id="compare-title">여러 업체의 견적을<br />한눈에 비교하고 선택해요</h2>
      </section>

      <section className={styles.closing} aria-label="무빙 서비스 소개">
        <Image src="/images/landing/landing-app-icon.png" alt="무빙" width={100} height={103} />
        <p>복잡한 이사 준비,<br className={styles.mobileBreak} /> 무빙 하나면 끝!</p>
      </section>
    </main>
  );
}
