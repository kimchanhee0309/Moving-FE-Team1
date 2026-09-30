"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";

import styles from "@/app/(public)/page.module.css";
import { resolveLandingHrefs } from "../landing.utils";

function useLandingHrefs() {
  const { user, status } = useAuth();
  return { ...resolveLandingHrefs(user), isLoading: status === "loading" };
}

const MOVE_TYPES = [
  { title: "소형이사", description: "원룸, 투룸, 20평대 미만", imageSrc: "/images/landing/types/small-move-box.webp", imageClassName: styles.moveTypeImageSmall },
  { title: "가정이사", description: "쓰리룸, 20평대 이상", imageSrc: "/images/landing/types/home-move-truck.webp", imageClassName: styles.moveTypeImageHome },
  { title: "사무실 이사", description: "사무실, 상업공간", imageSrc: "/images/landing/types/office-move-building.webp", imageClassName: styles.moveTypeImageOffice },
] as const;

function AuthAwareLink({ href, isLoading, className, label, children }: {
  href: string;
  isLoading: boolean;
  className: string;
  label: string;
  children: ReactNode;
}) {
  const preventPendingNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (isLoading) event.preventDefault();
  };

  return (
    <Link href={href} className={className} aria-label={label} aria-disabled={isLoading || undefined} onClick={preventPendingNavigation}>
      {children}
    </Link>
  );
}

export function MoveTypeCta() {
  const { requestHref, isLoading } = useLandingHrefs();

  return (
    <ul className={styles.moveTypeGrid} aria-label="이사 유형 선택">
      {MOVE_TYPES.map((moveType) => (
        <li key={moveType.title}>
          <AuthAwareLink href={requestHref} isLoading={isLoading} className={styles.moveTypeCard} label={`${moveType.title} 견적 요청하기`}>
            <Image src={moveType.imageSrc} alt="" width={1024} height={1024} sizes="(min-width: 1200px) 180px, (min-width: 744px) 150px, 92px" className={`${styles.moveTypeImage} ${moveType.imageClassName}`} />
            <h3>{moveType.title}</h3>
            <p>{moveType.description}</p>
          </AuthAwareLink>
        </li>
      ))}
    </ul>
  );
}

function QuotePreviewCard({ href, isLoading, index }: { href: string; isLoading: boolean; index: number }) {
  const prices = ["180,000원", "195,000원", "210,000원", "225,000원"];
  const names = ["김코드 기사님", "이무빙 기사님", "박안심 기사님", "최친절 기사님"];

  return (
    <AuthAwareLink href={href} isLoading={isLoading} className={styles.quoteCard} label={`${names[index]}의 ${prices[index]} 견적 확인하기`}>
      <div className={styles.quoteTags} aria-hidden="true"><span>소형이사</span><span>지정 견적 요청</span></div>
      <h3>고객님의 물품을 안전하게 운송해 드립니다.</h3>
      <div className={styles.moverSummary}>
        <Image src="/images/gnb/icon-profile-default.svg" alt="" width={36} height={36} />
        <p><strong>{names[index]}</strong><span>★ 5.0 · 경력 {7 + index}년</span></p>
        <span aria-label="찜 136개">♥ 136</span>
      </div>
      <dl className={styles.quoteRoute}>
        <div><dt>출발지</dt><dd>서울시 중구</dd></div>
        <div><dt>도착지</dt><dd>경기도 수원시</dd></div>
        <div><dt>이사일</dt><dd>2026년 10월 12일</dd></div>
      </dl>
      <p className={styles.quotePrice}><span>견적 금액</span><strong>{prices[index]}</strong></p>
      <span className={styles.cardAction} aria-hidden="true">견적 확인하기</span>
    </AuthAwareLink>
  );
}

export function RequestLandingCta() {
  const { requestHref, isLoading } = useLandingHrefs();

  return (
    <div className={styles.requestShowcase}>
      <AuthAwareLink href={requestHref} isLoading={isLoading} className={styles.requestCard} label="이사 견적 요청 시작하기">
        <div className={styles.requestCardHeader}><Image src="/images/gnb/logo-icon.svg" alt="" width={40} height={40} /><strong>무빙 견적 요청</strong></div>
        <div className={styles.requestProfile}>
          <Image src="/images/landing/types/small-move-box.webp" alt="" width={112} height={112} />
          <span>소형이사</span>
          <h3>고객님의 이사 정보를 알려주세요</h3>
        </div>
        <dl className={styles.requestDetails}>
          <div><dt>이사일</dt><dd>2026. 10. 12.</dd></div>
          <div><dt>출발지</dt><dd>서울시 중구</dd></div>
          <div><dt>도착지</dt><dd>경기도 수원시</dd></div>
        </dl>
        <span className={styles.cardAction} aria-hidden="true">견적 요청하기</span>
      </AuthAwareLink>
      <Image src="/images/landing/types/home-move-truck.webp" alt="" width={1024} height={1024} className={styles.requestDecoration} />
    </div>
  );
}

export function CompareLandingCta() {
  const { quoteHref, isLoading } = useLandingHrefs();
  return <div className={styles.quoteGrid}>{[0, 1, 2, 3].map((index) => <QuotePreviewCard key={index} href={quoteHref} isLoading={isLoading} index={index} />)}</div>;
}
