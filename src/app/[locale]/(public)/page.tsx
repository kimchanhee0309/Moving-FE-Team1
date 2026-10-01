import Image from "next/image";
import { useTranslations } from "next-intl";

import {
  CompareLandingCta,
  LandingHeroMedia,
  MoveTypeCta,
  RequestLandingCta,
} from "@/features/landing/components/MoveTypeCta";

// typography.css 클래스는 반응형 접두사가 적용되지 않아 화면별 제목 크기는 Tailwind 수치로 지정합니다.
const SECTION_TITLE_CLASS = "text-[20px]/8 font-bold break-keep min-[744px]:text-[32px]/[46px]";

/**
 * 랜딩은 섹션마다 제목(h1/h2)과 단락을 HTML로 두고, 카드·장식은 이미지 한 장이 아니라 개별 요소로 배치합니다.
 * 상호작용(링크 이동·hover·궤도·등장 효과)은 features/landing의 Client Component가 담당합니다.
 */
export default function HomePage() {
  const t = useTranslations("Landing");
  return (
    <main className="overflow-x-clip bg-(--gray-50) text-(--content-strong)">
      {/* 사진 위 어두운 막은 장식이라 별도 요소 대신 after 가상 요소로 그립니다. */}
      <section
        className="relative isolate flex min-h-[313px] flex-col items-center px-4 pt-[75px] pb-12 text-center text-(--gray-50) after:absolute after:inset-0 after:-z-10 after:bg-[rgb(70_43_20/70%)] after:bg-[linear-gradient(180deg,rgb(0_0_0/24%),rgb(0_0_0/60%))] after:content-[''] min-[744px]:min-h-[405px] min-[744px]:pt-[87px]"
        aria-labelledby="landing-title"
      >
        <LandingHeroMedia />
        <h1 id="landing-title" className={SECTION_TITLE_CLASS}>{t("heroTitle")}</h1>
        <p className="mt-2 text-base/[26px] text-(--gray-300) min-[744px]:mt-4 min-[744px]:text-lg/[29px]">
          {t("heroFirst")}<br />{t("heroSecond")}
        </p>
      </section>

      <section
        className="relative grid justify-items-start gap-6 px-4 pt-14 pb-10 text-left min-[744px]:gap-8 min-[744px]:px-8 min-[744px]:pt-20 min-[744px]:pb-[75px] min-[1200px]:block min-[1200px]:h-[509px] min-[1200px]:p-0"
        aria-labelledby="move-types-title"
      >
        <h2 id="move-types-title" className={`${SECTION_TITLE_CLASS} ml-6 min-[744px]:ml-0 min-[1200px]:absolute min-[1200px]:top-[196px] min-[1200px]:left-[calc(50%-543px)]`}>
          {t("typesFirst")}<br />{t("typesSecond")}
        </h2>
        <MoveTypeCta />
      </section>

      {/*
        Figma 견적 요청 영역(1402×787): 주황 둥근 패널 위에 흰 제목, 왼쪽에 견적 상세 카드(HTML),
        오른쪽에 M 패턴·캐릭터 장식을 둡니다. 1600px 이상은 1920 프레임 중앙 기준 좌표를 그대로 씁니다.
      */}
      <section
        className="relative isolate h-[512px] text-center before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-[205px] before:bg-(--primary-400) before:content-[''] min-[744px]:h-[871px] min-[744px]:before:inset-x-8 min-[744px]:before:h-[332px] min-[744px]:before:rounded-[40px] min-[1200px]:mx-auto min-[1600px]:mb-[61px] min-[1600px]:h-[787px] min-[1600px]:text-left min-[1600px]:before:inset-x-auto min-[1600px]:before:left-[calc(50%-689px)] min-[1600px]:before:h-[485.5px] min-[1600px]:before:w-[1402px] min-[1600px]:before:rounded-[71px]"
        aria-labelledby="request-title"
      >
        <Image className="pointer-events-none absolute top-0 right-0 z-0 h-auto w-[240px] max-w-none min-[744px]:right-8 min-[744px]:w-[360px] min-[1600px]:right-auto min-[1600px]:left-[calc(50%+161px)] min-[1600px]:w-[552px]" src="/images/landing/request-character.webp" alt="" width={1104} height={1573} sizes="(min-width: 1600px) 552px, (min-width: 744px) 360px, 240px" aria-hidden="true" />
        <h2 id="request-title" className={`${SECTION_TITLE_CLASS} absolute top-8 right-8 z-10 max-w-[275px] text-right text-(--gray-50) max-[743px]:text-[16px]/[25px] min-[744px]:top-[76px] min-[744px]:right-14 min-[744px]:max-w-[420px] min-[1600px]:top-[152px] min-[1600px]:right-auto min-[1600px]:left-[calc(50%+63px)] min-[1600px]:text-left`}>
          {t("requestFirst")}<br />{t("requestSecond")}
        </h2>
        <RequestLandingCta />
      </section>

      {/*
        Figma 견적 비교 영역(1920×1081): 아래 646px은 연한 주황 띠, 왼쪽에는 제목과 띠 경계에 걸친 건물,
        오른쪽에는 2열로 엇갈린 견적 카드 4장을 둡니다.
      */}
      <section
        className="relative isolate flex min-h-[1076px] flex-col items-center gap-8 px-4 pt-16 text-center before:absolute before:inset-x-0 before:top-[240px] before:bottom-0 before:-z-10 before:bg-(--primary-100) before:content-[''] min-[744px]:h-[1008px] min-[744px]:min-h-0 min-[744px]:px-8 min-[744px]:pt-[60px] min-[744px]:before:top-[312px] min-[1200px]:h-[1081px] min-[1600px]:block min-[1600px]:p-0 min-[1600px]:text-left min-[1600px]:before:top-auto min-[1600px]:before:h-[646px]"
        aria-labelledby="compare-title"
      >
        <h2 id="compare-title" className={`${SECTION_TITLE_CLASS} ml-6 self-start text-left min-[744px]:ml-0 min-[1600px]:absolute min-[1600px]:top-[153px] min-[1600px]:left-[calc(50vw-543px)]`}>
          {t("compareFirst")}<br />{t("compareSecond")}
        </h2>
        <Image className="pointer-events-none absolute top-[170px] right-0 z-0 h-auto w-[180px] min-[744px]:top-[199px] min-[744px]:right-[calc(50%-306px)] min-[744px]:w-[254px] min-[1600px]:top-[304px] min-[1600px]:right-auto min-[1600px]:left-[calc(50vw-547px)] min-[1600px]:w-[317px]" src="/images/landing/compare-buildings.svg" alt="" width={317} height={131} unoptimized />
        <CompareLandingCta />
      </section>

      <section
        className="flex min-h-[200px] flex-col items-center justify-center gap-4 bg-[linear-gradient(91deg,#f95d2e_3.3617%,var(--primary-400)_88.381%)] px-4 py-7 text-(--gray-50) min-[744px]:min-h-[311px] min-[744px]:gap-7"
        aria-labelledby="footer-title"
      >
        {/* 주황 배경 위에서 주황 로고가 보이도록 흰 타일 위에 SVG를 올립니다. */}
        <Image className="size-[72px] rounded-[20px] bg-(--gray-50) p-3 shadow-[0_8px_20px_rgb(0_0_0/12%)] min-[744px]:size-[100px] min-[744px]:rounded-[28px] min-[744px]:p-[18px]" src="/images/landing/brand-mark.svg" alt="" width={59} height={61} />
        <h2 id="footer-title" className="text-center text-base/[26px] font-bold min-[744px]:text-[28px]/[46px]">
          {t("footerFirst")}<br className="min-[744px]:hidden" /> {t("footerSecond")}
        </h2>
      </section>
    </main>
  );
}
