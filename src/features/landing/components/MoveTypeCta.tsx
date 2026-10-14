"use client";

import Image from "next/image";
import {
  LazyMotion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "motion/react";
import * as m from "motion/react-m";
import { useLocale, useTranslations } from "next-intl";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import { formatDateWithWeekday, formatLongDate } from "@/common/utils/date-format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Link } from "@/i18n/navigation";

import { resolveLandingHrefs } from "../landing.utils";

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;
// motion 대신 기능이 빠진 m 컴포넌트를 쓰고, 애니메이션 기능은 LandingMotionProvider가 hydration 뒤에 받습니다.
// 첫 화면을 그리기 전에 내려받는 JS를 줄이기 위한 구성이라 이 파일에서 motion 컴포넌트를 직접 import하지 않습니다.
const MotionImage = m.create(Image);
const loadMotionFeatures = () => import("../landing.motion-features").then((module) => module.default);

// 애니메이션 기능 묶음을 내려받지 못했는지 알려 줍니다. true면 각 컴포넌트가 모션 축소와 같은 정적 화면으로 바꿉니다.
const LandingMotionFailedContext = createContext(false);

/**
 * 랜딩의 m 컴포넌트에 애니메이션 기능을 지연 공급합니다. 랜딩 페이지가 본문 전체를 한 번 감쌉니다.
 * 기능이 도착하기 전에는 각 요소가 initial 상태로 보이다가 도착 즉시 애니메이션을 시작합니다.
 * 기능 묶음을 받지 못하면(네트워크 오류, 배포 직후 사라진 청크 등) initial의 opacity 0이 풀리지 않아
 * 트럭과 견적 요청·비교 카드의 링크가 영영 보이지 않으므로, 실패를 알려 정적 화면으로 전환합니다.
 */
export function LandingMotionProvider({ children }: { children: ReactNode }) {
  const [hasFailed, setHasFailed] = useState(false);
  const loadFeatures = () =>
    loadMotionFeatures().catch(() => {
      setHasFailed(true);
      // LazyMotion에는 실패를 넘기지 않고 끝나지 않는 Promise를 돌려줍니다. 화면 전환은 위 state가 담당합니다.
      return new Promise<never>(() => {});
    });

  return (
    <LandingMotionFailedContext.Provider value={hasFailed}>
      <LazyMotion features={loadFeatures}>{children}</LazyMotion>
    </LandingMotionFailedContext.Provider>
  );
}

/** 애니메이션 없이 최종 상태를 바로 보여야 하는지 판단합니다. 모션 축소 설정이거나 기능 묶음을 받지 못한 경우입니다. */
function useIsStaticLanding() {
  const hasMotionFailed = useContext(LandingMotionFailedContext);
  return Boolean(useReducedMotion()) || hasMotionFailed;
}

/**
 * initial 상태로 이미 그려진 m 요소는 props를 바꿔도 opacity 0이 남으므로, 정적 화면으로 바뀔 때 key를 바꿔 새로 그립니다.
 * 등장 효과(initial)를 쓰는 m 요소에 key로 지정합니다.
 */
function useLandingMotionKey() {
  return useIsStaticLanding() ? "static" : "motion";
}

// 랜딩 견적 요청·비교 카드의 고정 샘플입니다. 실제 기사님·견적 데이터가 아니며 이름·주소만 locale별 문구로 바꿉니다.
const SAMPLE_QUOTES = [
  { id: "kim", nameKey: "sampleMoverKim", price: 180_000, years: 7, reviews: 178, confirmed: 334 },
  { id: "lee", nameKey: "sampleMoverLee", price: 195_000, years: 8, reviews: 146, confirmed: 281 },
  { id: "park", nameKey: "sampleMoverPark", price: 210_000, years: 9, reviews: 209, confirmed: 418 },
  { id: "choi", nameKey: "sampleMoverChoi", price: 225_000, years: 10, reviews: 121, confirmed: 367 },
] as const;
const SAMPLE_REQUEST_DATE = new Date(2024, 7, 26);
const SAMPLE_COMPARE_DATE = new Date(2024, 6, 1);

function useLandingHrefs() {
  const { user, status } = useAuth();
  const isLoading = status === "loading";
  return { ...resolveLandingHrefs(user, isLoading), isLoading };
}

/** 스크롤로 섹션에 들어올 때 한 번만 아래에서 떠오릅니다. 모션 축소 설정에서는 정적으로 렌더합니다. */
function useRevealProps(amount = 0.25) {
  const shouldReduceMotion = useIsStaticLanding();
  return shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount },
        transition: { duration: 0.72, ease: REVEAL_EASE },
      };
}

/**
 * 세션 확인 전에는 잘못된 목적지로 이동하지 않도록 링크 대신 같은 모양의 블록을 렌더합니다.
 * 링크 안에는 button을 두지 않습니다.
 */
function AuthAwareLink({ href, isLoading, className, label, children }: {
  href: string | null;
  isLoading: boolean;
  className: string;
  label?: string;
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

/** 히어로 배경 사진과 트럭은 첫 진입 때만 짧게 자리를 잡습니다. */
export function LandingHeroMedia() {
  const shouldReduceMotion = useIsStaticLanding();
  const motionKey = useLandingMotionKey();

  return (
    <>
      <MotionImage
        key={`photo-${motionKey}`}
        className="-z-20 object-cover object-center opacity-80 min-[744px]:object-[center_32%]"
        src="/images/landing/hero-photo.jpeg"
        alt=""
        fill
        sizes="100vw"
        // LCP 이미지입니다. preload만으로는 <link rel="preload">와 img에 우선순위가 붙지 않아 CSS·JS와 같은 순위로 받으므로 함께 지정합니다.
        preload
        fetchPriority="high"
        initial={shouldReduceMotion ? false : { opacity: 0.58, scale: 1.035 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
      <MotionImage
        key={`truck-${motionKey}`}
        className="mb-5 h-auto w-[100px] min-[744px]:mb-7 min-[744px]:w-40"
        src="/images/landing/truck.svg"
        alt=""
        width={160}
        height={100}
        loading="eager"
        initial={shouldReduceMotion ? false : { opacity: 0, x: -40, y: 8 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, ease: REVEAL_EASE }}
      />
    </>
  );
}

/*
 * #76(e8daa7c)의 타원 궤도를 motion으로 옮겼습니다. 앞(크게) → 오른쪽 → 뒤(작고 흐리게) → 왼쪽 → 앞 순서로
 * 왼쪽에서 오른쪽으로 돌며, x는 반응형 CSS 변수 --orbit-x(앞쪽 가로 거리)의 배수로 계산합니다.
 */
const ORBIT_STOPS = [
  { x: 0, y: -46, scale: 1.06, opacity: 1, zIndex: 4 },
  { x: 1, y: -52, scale: 0.91, opacity: 0.88, zIndex: 3 },
  { x: 1.18, y: -62, scale: 0.76, opacity: 0.58, zIndex: 2 },
  { x: 0, y: -68, scale: 0.68, opacity: 0.3, zIndex: 1 },
  { x: -1.18, y: -62, scale: 0.76, opacity: 0.58, zIndex: 2 },
  { x: -1, y: -52, scale: 0.91, opacity: 0.88, zIndex: 3 },
  { x: 0, y: -46, scale: 1.06, opacity: 1, zIndex: 4 },
] as const;
const ORBIT_DURATION_SECONDS = 15;

function orbitFrame(progress: number) {
  const position = (((progress % 1) + 1) % 1) * (ORBIT_STOPS.length - 1);
  const index = Math.floor(position);
  const from = ORBIT_STOPS[index];
  const to = ORBIT_STOPS[Math.min(index + 1, ORBIT_STOPS.length - 1)];
  const ratio = position - index;
  const lerp = (a: number, b: number) => a + (b - a) * ratio;
  return {
    x: lerp(from.x, to.x),
    y: lerp(from.y, to.y),
    scale: lerp(from.scale, to.scale),
    opacity: lerp(from.opacity, to.opacity),
    zIndex: Math.round(lerp(from.zIndex, to.zIndex)),
  };
}

const MOVE_TYPES = [
  { title: "smallMove", description: "smallDescription", imageSrc: "/images/landing/types/small-move-box.webp", imageClassName: "h-[62px] mb-1 min-[744px]:h-[108px] min-[744px]:mb-1.5" },
  { title: "homeMove", description: "homeDescription", imageSrc: "/images/landing/types/home-move-truck.webp", imageClassName: "h-[72px] min-[744px]:h-32" },
  { title: "officeMove", description: "officeDescription", imageSrc: "/images/landing/types/office-move-building.webp", imageClassName: "h-16 mb-0.5 min-[744px]:h-28 min-[744px]:mb-1" },
] as const;

const MOVE_TYPE_CARD_CLASS = [
  "flex size-full flex-col items-center justify-end rounded-[18px] border-2 border-transparent bg-(--background-100) px-1.5 pt-2 pb-3.5 text-center text-(--content-strong)",
  "transition-[border-color,box-shadow] duration-200 min-[744px]:rounded-3xl min-[744px]:px-2.5 min-[744px]:pt-[18px] min-[744px]:pb-6",
  "[&[href]:hover]:border-(--primary-400) [&[href]:hover]:shadow-[0_8px_18px_rgb(249_80_46/14%)]",
  "[&[href]:focus-visible]:border-(--primary-400) [&[href]:focus-visible]:outline-none",
].join(" ");

function MoveTypeCardContent({ moveType }: { moveType: (typeof MOVE_TYPES)[number] }) {
  const t = useTranslations("Landing");
  return (
    <>
      <Image src={moveType.imageSrc} alt="" width={1024} height={1024} sizes="(min-width: 744px) 150px, 92px" className={`w-auto object-contain ${moveType.imageClassName}`} />
      <h3 className="text-[13px]/[18px] font-bold break-keep min-[744px]:text-[18px]/[26px]">{t(moveType.title)}</h3>
      <p className="mt-0.5 text-[10px]/[14px] text-(--gray-400) break-keep min-[744px]:mt-1 min-[744px]:text-xs/[18px]">{t(moveType.description)}</p>
    </>
  );
}

function OrbitItem({ progress, offset, children }: { progress: MotionValue<number>; offset: number; children: ReactNode }) {
  const transform = useTransform(progress, (value) => {
    const frame = orbitFrame(value + offset);
    return `translate(-50%, ${frame.y}%) translateX(calc(var(--orbit-x) * ${frame.x})) scale(${frame.scale})`;
  });
  const opacity = useTransform(progress, (value) => orbitFrame(value + offset).opacity);
  const zIndex = useTransform(progress, (value) => orbitFrame(value + offset).zIndex);

  return (
    <m.li
      className="absolute top-1/2 left-1/2 h-[150px] w-[108px] will-change-transform min-[744px]:h-[236px] min-[744px]:w-[196px]"
      style={{ transform, opacity, zIndex }}
    >
      {children}
    </m.li>
  );
}

/**
 * 이사 유형 카드 3장이 타원 궤도를 따라 왼쪽에서 오른쪽으로 순환합니다.
 * hover·focus 중에는 궤도가 멈추고 카드 테두리가 강조됩니다. 모션 축소 설정에서는 3열로 고정합니다.
 */
export function MoveTypeCta() {
  const t = useTranslations("Landing");
  const { requestHref, isLoading } = useLandingHrefs();
  const shouldReduceMotion = useIsStaticLanding();
  const revealProps = useRevealProps();
  const progress = useMotionValue(0);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  // 카드에 hover·focus가 걸려 있는지 기억합니다. animate 엔진이 늦게 도착해도 멈춘 상태로 시작하기 위한 값입니다.
  const isPausedRef = useRef(false);

  useEffect(() => {
    if (shouldReduceMotion) return;
    let isCancelled = false;
    // 궤도를 돌리는 animate 엔진은 첫 화면에 필요 없어 hydration 뒤에 따로 받습니다.
    // 도착 전에 unmount되거나 모션 축소로 바뀌면 시작하지 않습니다.
    void import("motion").then(({ animate }) => {
      if (isCancelled) return;
      const controls = animate(progress, [0, 1], { duration: ORBIT_DURATION_SECONDS, ease: "linear", repeat: Infinity });
      // 엔진을 받는 동안 사용자가 이미 카드를 가리키고 있었다면 궤도가 움직이지 않게 바로 멈춥니다.
      if (isPausedRef.current) controls.pause();
      controlsRef.current = controls;
    }).catch(() => {
      // 엔진을 받지 못하면 카드가 처음 위치에 멈춰 있을 뿐 링크는 그대로 쓸 수 있어 별도 처리 없이 둡니다.
    });
    return () => {
      isCancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [progress, shouldReduceMotion]);

  const pause = () => {
    isPausedRef.current = true;
    controlsRef.current?.pause();
  };
  const play = () => {
    isPausedRef.current = false;
    controlsRef.current?.play();
  };

  if (shouldReduceMotion) {
    return (
      <ul className="grid w-full grid-cols-3 gap-2 min-[744px]:max-w-[677px] min-[744px]:gap-4 min-[1200px]:absolute min-[1200px]:top-[100px] min-[1200px]:left-[calc(50%-100px)] min-[1200px]:w-[620px] min-[1200px]:max-w-none min-[1600px]:left-[calc(50%-76px)] min-[1600px]:w-[693px]" aria-label={t("moveTypes")}>
        {MOVE_TYPES.map((moveType) => (
          <li key={moveType.title} className="h-[150px] min-[744px]:h-[236px]">
            <AuthAwareLink href={requestHref} isLoading={isLoading} className={MOVE_TYPE_CARD_CLASS} label={t("requestType", { type: t(moveType.title) })}>
              <MoveTypeCardContent moveType={moveType} />
            </AuthAwareLink>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <m.ul
      className="relative h-[190px] w-full overflow-x-clip [--orbit-x:min(112px,28vw)] min-[744px]:h-[300px] min-[744px]:max-w-[677px] min-[744px]:[--orbit-x:200px] min-[1200px]:absolute min-[1200px]:top-[100px] min-[1200px]:left-[calc(50%-100px)] min-[1200px]:h-[310px] min-[1200px]:w-[620px] min-[1200px]:max-w-none min-[1600px]:left-[calc(50%-76px)] min-[1600px]:w-[693px]"
      aria-label={t("moveTypes")}
      onPointerEnter={pause}
      onPointerLeave={play}
      onFocus={pause}
      onBlur={play}
      {...revealProps}
    >
      {MOVE_TYPES.map((moveType, index) => (
        <OrbitItem key={moveType.title} progress={progress} offset={((index + 2) % MOVE_TYPES.length) / MOVE_TYPES.length}>
          <AuthAwareLink href={requestHref} isLoading={isLoading} className={MOVE_TYPE_CARD_CLASS} label={t("requestType", { type: t(moveType.title) })}>
            <MoveTypeCardContent moveType={moveType} />
          </AuthAwareLink>
        </OrbitItem>
      ))}
    </m.ul>
  );
}

/**
 * Figma 견적 요청 영역(1402×787)의 "견적 상세" 화면 예시를 HTML 카드로 그립니다.
 * 카드 전체가 견적 요청 시작 링크이며, 주황 패널·제목·캐릭터 장식은 page.tsx의 섹션이 배치합니다.
 */
export function RequestLandingCta() {
  const t = useTranslations("Landing");
  const quote = useTranslations("Quote");
  const moveType = useTranslations("MoveType");
  const locale = useLocale();
  const { requestHref, isLoading } = useLandingHrefs();
  const revealProps = useRevealProps(0.05);
  const motionKey = useLandingMotionKey();
  const sample = SAMPLE_QUOTES[0];

  return (
    <m.div key={motionKey} className="absolute top-[115px] left-[calc(50%-153px)] z-10 h-[350px] w-[226px] min-[744px]:top-[176px] min-[744px]:left-[calc(50%-270px)] min-[744px]:h-auto min-[744px]:w-[460px] min-[1600px]:top-[60px] min-[1600px]:left-[calc(50%-546px)] min-[1600px]:w-[520px]" {...revealProps}>
      <AuthAwareLink
        href={requestHref}
        isLoading={isLoading}
        label={t("startRequest")}
        className="block w-[390px] origin-top-left scale-[.58] overflow-hidden rounded-[20px] bg-(--gray-50) text-left text-(--black-400) shadow-[0_10px_40px_rgb(0_0_0/12%)] transition duration-200 min-[744px]:min-h-[600px] min-[744px]:w-full min-[744px]:scale-100 min-[1600px]:min-h-[681px] [&[href]:hover]:-translate-y-1 [&[href]:hover]:shadow-[0_18px_44px_rgb(0_0_0/16%)] [&[href]:focus-visible]:outline-3 [&[href]:focus-visible]:outline-offset-4 [&[href]:focus-visible]:outline-(--gray-50)"
      >
        <span className="flex items-center justify-between px-[38px] pt-5 pb-3" aria-hidden="true">
          <Image src="/images/landing/brand-mark.svg" alt="" width={22} height={23} />
          <span className="flex gap-3 text-(--gray-300)">
            <span className="size-3 rounded-full bg-current" />
            <span className="size-3 rounded-full bg-current" />
            <span className="h-0.5 w-3 self-center bg-current" />
          </span>
        </span>
        <span className="block px-[38px] pb-3 text-xs font-semibold">{quote("detailTitle")}</span>
        <span className="relative block h-[110px] bg-(--primary-400)" aria-hidden="true">
          <Image className="absolute bottom-[-14px] left-[38px] size-[70px] rounded-xl bg-(--black-300) object-cover" src="/images/landing/mover-character.webp" alt="" width={80} height={80} />
        </span>
        <div className="flex flex-col gap-4 px-[38px] pt-8 pb-7 min-[1200px]:gap-6 min-[1200px]:pt-10">
          <p className="flex gap-1.5">
            <span className="rounded bg-(--primary-100) px-1.5 py-0.5 text-[10px]/4 font-semibold text-(--primary-400)">{moveType("SMALL")}</span>
            <span className="rounded bg-(--secondary-red-100) px-1.5 py-0.5 text-[10px]/4 font-semibold text-(--secondary-red-200)">{moveType("designated")}</span>
          </p>
          <div className="flex items-start justify-between gap-3 border-b border-(--line-100) pb-4">
            <h3 className="text-[15px]/[22px] font-semibold break-keep">{t("previewDescription")}</h3>
            <span className="shrink-0 text-[10px] text-(--gray-400)">{quote("pending")}</span>
          </div>
          <p className="flex items-center justify-between border-b border-(--line-100) pb-4 text-[11px] text-(--gray-400)">
            <span>
              <span className="block text-xs font-semibold text-(--black-300)">{t(sample.nameKey)}</span>
              ★ 5.0 ({sample.reviews}) · {quote("career")} {quote("careerYears", { count: sample.years })}
            </span>
            <span className="text-xs text-(--gray-500)">136 ♥</span>
          </p>
          <p className="flex items-center gap-10 border-b border-(--line-100) pb-4 text-[13px]">
            <span className="text-(--gray-400)">{quote("priceTitle")}</span>
            <span className="text-base font-bold">{quote("priceValue", { price: sample.price })}</span>
          </p>
          <dl className="grid gap-2.5 text-[11px] [&>div]:grid [&>div]:grid-cols-[80px_1fr] [&_dd]:font-semibold [&_dd]:break-keep [&_dt]:text-(--gray-400)">
            <div><dt>{quote("moveType")}</dt><dd>{moveType("OFFICE")}</dd></div>
            <div><dt>{quote("useDate")}</dt><dd>{formatLongDate(SAMPLE_REQUEST_DATE, locale)}</dd></div>
            <div><dt>{quote("from")}</dt><dd>{t("sampleFrom")}</dd></div>
            <div><dt>{quote("to")}</dt><dd>{t("sampleTo")}</dd></div>
          </dl>
        </div>
      </AuthAwareLink>
    </m.div>
  );
}

const ACTION_BASE_CLASS = "flex h-7 flex-1 items-center justify-center rounded-xl text-[10.4px] font-semibold transition-colors min-[744px]:h-[33px] min-[1600px]:h-[35px]";

/** 카드 안 두 행동은 각각 독립된 링크입니다. 세션 확인 전에는 비활성 표시만 합니다. */
function QuoteAction({ href, isLoading, variant, children }: { href: string | null; isLoading: boolean; variant: "outline" | "solid"; children: ReactNode }) {
  const variantClass = variant === "outline"
    ? "border border-(--primary-400) text-(--primary-400) shadow-[2.6px_2.6px_6.5px_rgb(195_217_242/20%)] hover:bg-(--primary-100)"
    : "bg-(--primary-400) text-(--gray-50) hover:bg-[#e04829]";

  if (isLoading || href === null) {
    return <span className={`${ACTION_BASE_CLASS} ${variantClass} opacity-60`} aria-disabled="true">{children}</span>;
  }

  return <Link href={href} className={`${ACTION_BASE_CLASS} ${variantClass} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--black-400)`}>{children}</Link>;
}

/** Figma "Card-list/대기중인내역"(랜딩 축소판 390px)을 HTML로 그립니다. */
function QuotePreviewCard({ sample, href, isLoading, isMobileHidden = false }: { sample: (typeof SAMPLE_QUOTES)[number]; href: string | null; isLoading: boolean; isMobileHidden?: boolean }) {
  const t = useTranslations("Landing");
  const quote = useTranslations("Quote");
  const moveType = useTranslations("MoveType");
  const locale = useLocale();

  return (
    <article className={`flex w-full flex-col gap-2.5 rounded-[20px] border-[0.5px] border-(--line-200) bg-(--gray-50) px-4 py-3 text-left shadow-[-1.3px_-1.3px_6.5px_rgb(220_220_220/20%),1.3px_1.3px_6.5px_rgb(220_220_220/20%)] transition duration-200 hover:-translate-y-1 hover:border-(--primary-400) hover:shadow-[0_12px_24px_rgb(249_80_46/14%)] min-[744px]:gap-4 min-[744px]:px-5 min-[744px]:py-[18px] min-[1600px]:w-[390px] min-[1600px]:gap-[26px] min-[1600px]:px-[26px] min-[1600px]:py-5 ${isMobileHidden ? "max-[743px]:hidden" : ""}`}>
      <div className="flex flex-col gap-2.5 min-[744px]:gap-2.5 min-[1600px]:gap-4">
        <p className="flex gap-[5px]">
          <span className="flex items-center gap-[2.6px] rounded-md bg-(--primary-100) py-[2.6px] pr-[4.5px] pl-[3.2px] text-[9.1px]/[15.6px] font-semibold text-(--primary-400)">
            <Image src="/icons/ic-solid-box.svg" alt="" width={13} height={13} />{moveType("SMALL")}
          </span>
          <span className="flex items-center gap-[2.6px] rounded-md bg-(--secondary-red-100) py-[2.6px] pr-[4.5px] pl-[3.2px] text-[9.1px]/[15.6px] font-semibold text-(--secondary-red-200)">
            <Image src="/icons/ic-solid-document.svg" alt="" width={13} height={13} />{moveType("designated")}
          </span>
        </p>
        <div className="flex flex-col gap-[2.6px]">
          <h3 className="text-[11.7px]/[16.9px] font-semibold text-(--black-300) break-keep">{t("previewDescription")}</h3>
          <div className="flex items-center gap-[5px] border-b-[0.65px] border-(--line-200) pt-1 pb-1.5 min-[744px]:pb-2 min-[1600px]:pt-2 min-[1600px]:pb-[13px]">
            <span className="relative size-[32.5px] shrink-0 overflow-hidden rounded-xl bg-(--black-300)">
              <Image className="absolute top-[-4.5px] left-[-8px] size-[48.7px] max-w-none object-cover" src="/images/landing/mover-character.webp" alt="" width={80} height={80} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-[2.6px]">
              <p className="flex items-center justify-between">
                <span className="flex items-center gap-[2.6px] text-[9.1px]/[15.6px] font-semibold text-(--black-300)">
                  <Image src="/icons/ic-moving-badge.svg" alt="" width={10} height={12} />{t(sample.nameKey)}
                </span>
                <span className="flex items-center gap-[1.3px] text-[9.1px]/[15.6px] text-(--gray-500)" aria-label={t("favorites", { count: 136 })}>
                  <Image src="/icons/ic-like.svg" alt="" width={16} height={16} />136
                </span>
              </p>
              <p className="flex flex-wrap items-center gap-[5px] text-[8.4px]/[14.3px] font-medium text-(--gray-300)">
                <span className="flex items-center gap-[1.3px]">
                  <Image src="/icons/ic-star.svg" alt="" width={13} height={13} />
                  <span className="text-(--black-300)">5.0</span>({sample.reviews})
                </span>
                <span className="h-[9px] w-px bg-(--line-200)" aria-hidden="true" />
                <span>{quote("career")} <span className="text-(--black-300)">{quote("careerYears", { count: sample.years })}</span></span>
                <span className="h-[9px] w-px bg-(--line-200)" aria-hidden="true" />
                <span><span className="text-(--black-300)">{quote("confirmedCount", { count: sample.confirmed })}</span> {quote("confirmedLabel")}</span>
              </p>
            </div>
          </div>
        </div>
        {/* dl 바로 아래에 화살표 이미지와 중첩 div가 오면 목록 구조가 깨지므로 항목마다 dl을 따로 둡니다. */}
        <div className="flex items-start justify-between gap-3 text-[9.1px]/[15.6px] [&_dd]:text-[10.4px]/[16.9px] [&_dd]:font-semibold [&_dd]:text-(--black-500) [&_dd]:break-keep [&_dt]:text-(--gray-500)">
          <div className="flex items-end gap-2">
            <dl><dt>{t("from")}</dt><dd>{t("sampleFrom")}</dd></dl>
            <Image className="mb-0.5" src="/images/landing/route-arrow.svg" alt="" width={10} height={15} />
            <dl><dt>{t("to")}</dt><dd>{t("sampleTo")}</dd></dl>
          </div>
          <dl><dt>{t("movingDate")}</dt><dd><span className="min-[744px]:hidden">{formatLongDate(SAMPLE_COMPARE_DATE, locale)}</span><span className="hidden min-[744px]:inline">{formatDateWithWeekday(SAMPLE_COMPARE_DATE, locale)}</span></dd></dl>
        </div>
        <p className="flex h-[26px] items-end justify-between border-t-[0.65px] border-(--line-200) text-[10.4px]/[16.9px] font-medium text-(--black-400) min-[744px]:h-[30px] min-[1600px]:h-[34px]">
          {quote("price")}
          <span className="text-[15.6px]/[20.8px] font-bold">{quote("priceValue", { price: sample.price })}</span>
        </p>
      </div>
      <div className="flex gap-[7px]">
        <QuoteAction href={href} isLoading={isLoading} variant="outline">{quote("detail")}</QuoteAction>
        <QuoteAction href={href} isLoading={isLoading} variant="solid">{quote("confirm")}</QuoteAction>
      </div>
    </article>
  );
}

/**
 * Figma 견적 비교 영역: 왼쪽 열 2장(top 86px), 오른쪽 열 2장(top 295px)을 엇갈려 배치합니다.
 * 1600px 이상은 1920 프레임의 중앙 기준 좌표를 그대로 쓰고, 그 아래는 2열·1열 흐름으로 쌓습니다.
 */
export function CompareLandingCta() {
  const t = useTranslations("Landing");
  const { quoteHref, isLoading } = useLandingHrefs();
  const revealProps = useRevealProps(0.05);
  const motionKey = useLandingMotionKey();
  const columns = [SAMPLE_QUOTES.slice(0, 2), SAMPLE_QUOTES.slice(2, 4)];

  return (
    <m.ul key={motionKey} className="relative z-10 mt-[156px] grid w-full max-w-[796px] gap-3 min-[744px]:mt-[26px] min-[744px]:w-[calc(100vw-64px)] min-[744px]:max-w-[680px] min-[744px]:self-start min-[744px]:grid-cols-2 min-[744px]:items-start min-[744px]:gap-4 min-[1200px]:self-center min-[1600px]:static min-[1600px]:mt-0 min-[1600px]:w-full min-[1600px]:max-w-[796px] min-[1600px]:gap-[17px]" aria-label={t("compareFirst")} {...revealProps}>
      {columns.map((column, columnIndex) => (
        <li
          key={column[0].id}
          className={`grid gap-3 min-[744px]:gap-4 min-[1600px]:gap-[17px] ${columnIndex === 0 ? "min-[1600px]:absolute min-[1600px]:top-[86px] min-[1600px]:left-[calc(50vw-87px)]" : "min-[744px]:mt-[178px] min-[1600px]:absolute min-[1600px]:top-[295px] min-[1600px]:left-[calc(50vw+323px)] min-[1600px]:mt-0"}`}
        >
          {column.map((sample, sampleIndex) => (
            <QuotePreviewCard key={sample.id} sample={sample} href={quoteHref} isLoading={isLoading} isMobileHidden={columnIndex === 1 && sampleIndex === 1} />
          ))}
        </li>
      ))}
    </m.ul>
  );
}
