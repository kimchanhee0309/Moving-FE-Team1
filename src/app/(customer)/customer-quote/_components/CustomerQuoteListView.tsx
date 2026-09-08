"use client";

import { useRouter } from "next/navigation";

import { SubHeader } from "@/common/components/SubHeader";
import { Tabs } from "@/common/components/Tabs";
import { QUOTE_STATUS, SERVICE_TYPE } from "@/common/constants/domain";
import type { QuoteStatus, ServiceType } from "@/common/constants/domain";
import { ROUTES } from "@/common/constants/routes";
import { QuoteCard } from "@/features/customer-quote/components";

interface QuoteListItem {
  id: string;
  serviceType: ServiceType;
  isDesignated: boolean;
  status: QuoteStatus;
  message: string;
  moverName: string;
  rating: number;
  reviewCount: number;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
  price: number;
}

/**
 * 내 견적 관리(대기 중인 견적) UI입니다. 견적 목록 API가 아직 없어서
 * Figma(node 510:40184) 수치·카피로 화면만 구성합니다. 목록 조회가
 * 연결되면 이 mock을 제거하고 서버 데이터로 교체합니다.
 */
const MOCK_MOVE_REQUEST = {
  serviceType: SERVICE_TYPE.SMALL,
  requestedAt: "2024년 6월 24일",
  from: "서울시 중구",
  to: "경기도 수원시",
  moveDate: "2024년 07월 01일 (월)",
} as const;

const MOCK_QUOTE_LIST: QuoteListItem[] = [
  {
    id: "quote-1",
    serviceType: SERVICE_TYPE.SMALL,
    isDesignated: true,
    status: QUOTE_STATUS.PENDING,
    message: "고객님의 물품을 안전하게 운송해 드립니다.",
    moverName: "김코드",
    rating: 5,
    reviewCount: 178,
    careerYears: 7,
    confirmedCount: 334,
    favoriteCount: 136,
    price: 180000,
  },
  {
    id: "quote-2",
    serviceType: SERVICE_TYPE.SMALL,
    isDesignated: true,
    status: QUOTE_STATUS.PENDING,
    message: "고객님의 물품을 안전하게 운송해 드립니다.",
    moverName: "김코드",
    rating: 5,
    reviewCount: 178,
    careerYears: 7,
    confirmedCount: 334,
    favoriteCount: 136,
    price: 180000,
  },
  {
    id: "quote-3",
    serviceType: SERVICE_TYPE.SMALL,
    isDesignated: true,
    status: QUOTE_STATUS.PENDING,
    message: "고객님의 물품을 안전하게 운송해 드립니다.",
    moverName: "김코드",
    rating: 5,
    reviewCount: 178,
    careerYears: 7,
    confirmedCount: 334,
    favoriteCount: 136,
    price: 180000,
  },
  {
    id: "quote-4",
    serviceType: SERVICE_TYPE.SMALL,
    isDesignated: true,
    status: QUOTE_STATUS.PENDING,
    message: "고객님의 물품을 안전하게 운송해 드립니다.",
    moverName: "김코드",
    rating: 5,
    reviewCount: 178,
    careerYears: 7,
    confirmedCount: 334,
    favoriteCount: 136,
    price: 180000,
  },
];

export function CustomerQuoteListView() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[var(--background-100)]">
      <h1 className="sr-only">내 견적 관리</h1>
      <Tabs
        ariaLabel="견적 목록"
        value="pending"
        items={[
          {
            id: "pending",
            label: "대기 중인 견적",
            href: ROUTES.CUSTOMER.QUOTE.PENDING,
          },
          {
            id: "history",
            label: "받았던 견적",
            href: ROUTES.CUSTOMER.QUOTE.HISTORY,
          },
        ]}
      />
      <SubHeader
        serviceType={MOCK_MOVE_REQUEST.serviceType}
        requestedAt={MOCK_MOVE_REQUEST.requestedAt}
        from={MOCK_MOVE_REQUEST.from}
        to={MOCK_MOVE_REQUEST.to}
        moveDate={MOCK_MOVE_REQUEST.moveDate}
      />
      <section
        aria-label="받은 견적 목록"
        className={[
          "px-6 py-6",
          "min-[744px]:px-[72px] min-[744px]:py-8",
          "min-[1200px]:px-[clamp(72px,18.75vw,360px)] min-[1200px]:py-10",
        ].join(" ")}
      >
        <ul className="grid grid-cols-1 gap-6 min-[1200px]:grid-cols-2">
          {MOCK_QUOTE_LIST.map((quote) => (
            <li key={quote.id}>
              <QuoteCard
                serviceType={quote.serviceType}
                isDesignated={quote.isDesignated}
                status={quote.status}
                message={quote.message}
                moverName={quote.moverName}
                rating={quote.rating}
                reviewCount={quote.reviewCount}
                careerYears={quote.careerYears}
                confirmedCount={quote.confirmedCount}
                favoriteCount={quote.favoriteCount}
                price={quote.price}
                onDetail={() => {
                  router.push(ROUTES.CUSTOMER.QUOTE.DETAIL(quote.id));
                }}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
