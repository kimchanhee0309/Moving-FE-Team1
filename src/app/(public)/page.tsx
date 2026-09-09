import Image from "next/image";

/**
 * 재사용되지 않는 랜딩 UI는 리뷰 기준에 따라 page.tsx에 직접 둡니다.
 * Figma 랜딩의 375/744/1920 프레임별 이미지를 picture source와 공통 breakpoint로 전환합니다.
 */
export default function HomePage() {
  return (
    <main className="overflow-clip bg-[var(--gray-50)]">
      <section
        className="relative isolate h-[313px] min-[744px]:h-[405px]"
        aria-labelledby="landing-title"
      >
        <Image
          className="-z-20 object-cover object-center opacity-80 min-[744px]:object-[center_31.955%]"
          src="/images/landing/hero-photo.jpeg"
          alt=""
          fill
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(0_0_0_/_24%),rgb(0_0_0_/_60%)),rgb(70_43_20_/_70%)]"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center px-5 pt-[75px] text-center text-[var(--gray-50)] min-[744px]:pt-[87px]">
          <Image
            className="mb-5 h-[62px] w-[100px] object-contain min-[744px]:mb-7 min-[744px]:h-[100px] min-[744px]:w-[160px]"
            src="/images/landing/truck.svg"
            alt=""
            width={160}
            height={100}
            priority
          />
          <h1 id="landing-title" className="text-xl-bold min-[744px]:text-[32px] min-[744px]:leading-[46px]">
            이사업체, 어떻게 고르세요?
          </h1>
          <p className="text-lg-regular mt-2 text-[var(--gray-300)] min-[744px]:mt-4 min-[744px]:text-[18px]">
            무빙은 여러 견적을 한눈에 비교해
            <br />
            이사업체 선정 과정을 간편하게 바꿔드려요
          </p>
        </div>
      </section>

      <section
        className="mx-auto flex min-h-[374px] max-w-[1086px] flex-col gap-[34px] pb-[61px] pt-[53px] min-[744px]:min-h-[460px] min-[744px]:items-start min-[744px]:gap-10 min-[744px]:px-10 min-[744px]:py-20 min-[1200px]:min-h-[509px] min-[1200px]:flex-row min-[1200px]:items-center min-[1200px]:justify-between min-[1200px]:px-0"
        aria-labelledby="move-types-title"
      >
        <h2
          id="move-types-title"
          className="text-xl-bold shrink-0 px-8 text-[var(--content-strong)] min-[744px]:px-0 min-[744px]:text-[32px] min-[744px]:leading-[46px]"
        >
          번거로운 선정과정,
          <br />
          이사 유형부터 선택해요
        </h2>
        <picture className="w-full min-[744px]:w-[min(100%,693px)] min-[744px]:self-center min-[1200px]:w-[64%]">
          <Image
            className="h-auto w-full"
            src="/images/landing/types-mobile.png"
            alt="소형이사, 가정이사, 기업·사무실 이사 중 필요한 유형을 선택할 수 있습니다."
            width={750}
            height={324}
          />
        </picture>
      </section>

      <section
        className="relative mx-auto mb-4 max-w-[1402px] min-[744px]:mb-[61px]"
        aria-labelledby="request-title"
      >
        <picture>
          <source media="(max-width: 743px)" srcSet="/images/landing/request-mobile.png" />
          <Image
            className="block h-auto w-full"
            src="/images/landing/request-desktop.png"
            alt="이사 정보와 서비스 내용을 확인하는 견적 요청 화면 예시"
            width={1402}
            height={787}
          />
        </picture>
        <h2
          id="request-title"
          className="text-xl-bold absolute right-[8.5%] top-[5.8%] text-right text-[var(--gray-50)] min-[744px]:left-[53%] min-[744px]:right-auto min-[744px]:top-[19.3%] min-[744px]:text-left min-[744px]:text-[22px] min-[744px]:leading-8 min-[1200px]:left-[53.7%] min-[1200px]:text-[32px] min-[1200px]:leading-[46px]"
        >
          원하는 이사 서비스를 요청하고
          <br />
          견적을 받아보세요
        </h2>
      </section>

      <section className="relative mx-auto max-w-[1920px]" aria-labelledby="compare-title">
        <picture>
          <source media="(max-width: 743px)" srcSet="/images/landing/compare-mobile.png" />
          <Image
            className="block h-auto w-full"
            src="/images/landing/landing-compare.png"
            alt="여러 기사님의 평점, 경력과 견적 금액을 비교하는 화면 예시"
            width={1920}
            height={1081}
          />
        </picture>
        <h2
          id="compare-title"
          className="text-xl-bold absolute left-[8.5%] top-[5.2%] text-[var(--content-strong)] min-[744px]:left-[12%] min-[744px]:top-[14.2%] min-[744px]:text-[22px] min-[744px]:leading-8 min-[1200px]:left-[21.7%] min-[1200px]:text-[32px] min-[1200px]:leading-[46px]"
        >
          여러 업체의 견적을
          <br />
          한눈에 비교하고 선택해요
        </h2>
      </section>

      <section
        className="flex min-h-[200px] flex-col items-center justify-center gap-3 bg-[var(--primary-400)] text-[var(--gray-50)] min-[744px]:min-h-[355px] min-[744px]:gap-8"
        aria-label="무빙 서비스 소개"
      >
        <Image
          className="h-[58px] w-14 object-contain min-[744px]:h-[103px] min-[744px]:w-[100px]"
          src="/images/landing/landing-app-icon.png"
          alt="무빙"
          width={100}
          height={103}
        />
        <p className="text-lg-bold text-center min-[744px]:text-[28px] min-[744px]:leading-[46px]">
          복잡한 이사 준비,
          <br className="min-[744px]:hidden" /> 무빙 하나면 끝!
        </p>
      </section>
    </main>
  );
}
