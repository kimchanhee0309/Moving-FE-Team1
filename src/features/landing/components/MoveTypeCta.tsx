"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ROUTES } from "@/common/constants/routes";
import { authHref } from "@/features/auth/auth.utils";
import { useAuth } from "@/features/auth/hooks/useAuth";

import styles from "@/app/(public)/page.module.css";

function useLandingHrefs() {
  const { user, status } = useAuth();
  const requestHref = user?.role === "CUSTOMER"
    ? ROUTES.CUSTOMER.MOVE_REQUEST
    : user?.role === "MOVER"
      ? ROUTES.MOVER.REQUESTS
      : authHref(ROUTES.AUTH.LOGIN.CUSTOMER, ROUTES.CUSTOMER.MOVE_REQUEST);
  const quoteHref = user?.role === "CUSTOMER"
    ? ROUTES.CUSTOMER.QUOTE.PENDING
    : user?.role === "MOVER"
      ? ROUTES.MOVER.QUOTE.LIST
      : authHref(ROUTES.AUTH.LOGIN.CUSTOMER, ROUTES.CUSTOMER.QUOTE.PENDING);

  return { requestHref, quoteHref, isLoading: status === "loading" };
}

const MOVE_TYPES = [
  {
    title: "소형이사",
    description: "원룸, 투룸, 20평대 미만",
    imageSrc: "/images/landing/types/small-move-box.webp",
    imageAlt: "소형 이삿짐 상자",
    imageClassName: styles.moveTypeImageSmall,
  },
  {
    title: "가정이사",
    description: "쓰리룸, 20평대 미만",
    imageSrc: "/images/landing/types/home-move-truck.webp",
    imageAlt: "가정 이사 트럭",
    imageClassName: styles.moveTypeImageHome,
  },
  {
    title: "사무실 이사",
    description: "사무실, 상업공간",
    imageSrc: "/images/landing/types/office-move-building.webp",
    imageAlt: "사무실 건물",
    imageClassName: styles.moveTypeImageOffice,
  },
] as const;

function MoveTypeOrbit({ isLoading, shouldReduceMotion, onSelect }: { isLoading: boolean; shouldReduceMotion: boolean; onSelect: () => void }) {
  return (
    <div className={styles.moveTypeOrbit}>
      {MOVE_TYPES.map((moveType, index) => (
        <div
          key={moveType.title}
          className={styles.moveTypeOrbitItem}
          style={{ animationDelay: `${index * -5}s` }}
        >
          <motion.button
            type="button"
            className={styles.moveTypeCard}
            aria-label={`${moveType.title} 견적 요청하기`}
            disabled={isLoading}
            whileHover={shouldReduceMotion ? undefined : { y: -7, scale: 1.035 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            onClick={onSelect}
          >
            <Image
              src={moveType.imageSrc}
              alt={moveType.imageAlt}
              width={1024}
              height={1024}
              sizes="(min-width: 1200px) 150px, (min-width: 744px) 140px, 90px"
              className={`${styles.moveTypeImage} ${moveType.imageClassName}`}
            />
            <strong>{moveType.title}</strong>
            <span>{moveType.description}</span>
          </motion.button>
        </div>
      ))}
    </div>
  );
}

/** 피그마 카드 구성을 유지한 채 앞·옆·뒤 깊이를 오가는 타원형 궤도의 이사 유형 CTA입니다. */
export function MoveTypeCta() {
  const router = useRouter();
  const { requestHref, isLoading } = useLandingHrefs();
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <motion.div
      className={styles.typesCta}
      aria-label="이사 유형 선택"
      initial={shouldReduceMotion ? false : { opacity: 1, y: 18, scale: 0.992 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <MoveTypeOrbit isLoading={isLoading} shouldReduceMotion={shouldReduceMotion} onSelect={() => router.push(requestHref)} />
    </motion.div>
  );
}

interface PictureCtaProps {
  ariaLabel: string;
  className: string;
  href: string;
  isLoading: boolean;
  variant: "request" | "compare";
  children: ReactNode;
}

const COMPARE_CARD_HOTSPOTS = [
  { className: styles.compareCardHotspotOne, label: "첫 번째 견적 카드 비교하기" },
  { className: styles.compareCardHotspotTwo, label: "두 번째 견적 카드 비교하기" },
  { className: styles.compareCardHotspotThree, label: "세 번째 견적 카드 비교하기" },
  { className: styles.compareCardHotspotFour, label: "네 번째 견적 카드 비교하기" },
] as const;

function PictureCta({ ariaLabel, className, href, isLoading, variant, children }: PictureCtaProps) {
  const router = useRouter();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const isRequestSection = variant === "request";
  const hotspots = variant === "request"
    ? [{ className: styles.requestCardHotspot, label: "견적 요청 예시 카드 열기" }]
    : COMPARE_CARD_HOTSPOTS;

  return (
    <motion.div
      className={`${styles.pictureCta} ${className}`}
      role="group"
      aria-label={ariaLabel}
      initial={shouldReduceMotion
        ? false
        : isRequestSection
          ? { opacity: 0.38, y: 54, scale: 0.992 }
          : { opacity: 1, y: 24, scale: 0.995 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: isRequestSection ? 0.22 : 0.16, margin: "0px 0px -8% 0px" }}
      transition={{ duration: isRequestSection ? 0.92 : 0.78, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
      {hotspots.map((hotspot) => (
        <motion.button
          key={hotspot.label}
          type="button"
          className={`${styles.quoteCardHotspot} ${hotspot.className}`}
          aria-label={hotspot.label}
          disabled={isLoading}
          onClick={() => router.push(href)}
        />
      ))}
    </motion.div>
  );
}

/** 피그마의 견적 요청 화면을 그대로 유지하면서 전체 예시를 실제 CTA로 제공합니다. */
export function RequestLandingCta() {
  const { requestHref, isLoading } = useLandingHrefs();
  return (
    <PictureCta ariaLabel="견적 요청 시작하기" className={styles.requestImage} href={requestHref} isLoading={isLoading} variant="request">
      <picture>
        <source media="(min-width: 1200px)" srcSet="/images/landing/request-desktop.webp" />
        <source media="(min-width: 744px)" srcSet="/images/landing/request-tablet.webp" />
        <Image src="/images/landing/request-mobile-frame.webp" alt="이사 정보와 서비스 내용을 확인하는 견적 요청 화면 예시" width={1500} height={1984} sizes="(min-width: 1200px) 1402px, (min-width: 744px) 680px, 100vw" unoptimized />
      </picture>
    </PictureCta>
  );
}

/** 피그마의 견적 비교 화면을 그대로 유지하면서 로그인·견적 목록 이동을 연결합니다. */
export function CompareLandingCta() {
  const { quoteHref, isLoading } = useLandingHrefs();
  return (
    <PictureCta ariaLabel="여러 업체의 견적 비교하기" className={styles.compareImage} href={quoteHref} isLoading={isLoading} variant="compare">
      <picture>
        <source media="(min-width: 1200px)" srcSet="/images/landing/landing-compare.webp" />
        <source media="(min-width: 744px)" srcSet="/images/landing/compare-tablet.webp" />
        <Image src="/images/landing/compare-mobile.webp" alt="여러 기사님의 평점, 경력과 견적 금액을 비교하는 화면 예시" width={1500} height={4304} sizes="100vw" unoptimized />
      </picture>
    </PictureCta>
  );
}
