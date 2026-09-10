import { SERVICE_TYPE } from "@/common/constants/domain";

import {
  MOVER_SEARCH_PAGE_SIZE,
  SIDEBAR_MOVER_LIMIT,
} from "./mover-search.constants";
import type {
  MoverDetail,
  MoverReview,
  MoverReviewSummary,
  MoverSearchListParams,
  MoverSearchPageResult,
  MoverSearchResult,
} from "./mover-search.types";

export const MOCK_MOVER_SEARCH_RESULTS: MoverSearchResult[] = [
  {
    id: "mover-1",
    serviceType: SERVICE_TYPE.SMALL,
    region: "seoul",
    moverName: "김코드",
    introduction: "고객님의 물품을 안전하게 운송해 드립니다.",
    description: "이사업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다.",
    profileImageUrl: null,
    rating: 5.0,
    reviewCount: 178,
    careerYears: 7,
    confirmedCount: 334,
    favoriteCount: 136,
  },
  {
    id: "mover-2",
    serviceType: SERVICE_TYPE.OFFICE,
    region: "gyeonggi",
    moverName: "박이사",
    introduction: "사무실 이사 전문, 꼼꼼하게 도와드립니다.",
    description: "소형이사부터 사무실 이사까지 폭넓게 도와드리는 박이사입니다.",
    profileImageUrl: null,
    rating: 4.8,
    reviewCount: 256,
    careerYears: 10,
    confirmedCount: 512,
    favoriteCount: 289,
  },
  {
    id: "mover-3",
    serviceType: SERVICE_TYPE.HOME,
    region: "incheon",
    moverName: "이든",
    introduction: "가정이사 전문가가 꼼꼼하게 도와드립니다.",
    description: "소형이사부터 가정이사까지 꼼꼼하게 도와드립니다.",
    profileImageUrl: null,
    rating: 4.9,
    reviewCount: 198,
    careerYears: 5,
    confirmedCount: 201,
    favoriteCount: 312,
  },
  {
    id: "mover-4",
    serviceType: SERVICE_TYPE.SMALL,
    region: "busan",
    moverName: "최민준",
    introduction: "빠르고 안전한 소형이사를 약속드립니다.",
    description:
      "1인 가구 소형이사에 특화된 최민준입니다. 부산 전역 서비스 가능합니다.",
    profileImageUrl: null,
    rating: 4.7,
    reviewCount: 89,
    careerYears: 3,
    confirmedCount: 120,
    favoriteCount: 54,
  },
  {
    id: "mover-5",
    serviceType: SERVICE_TYPE.HOME,
    region: "daegu",
    moverName: "정하늘",
    introduction: "고객님의 새 보금자리, 정성껏 옮겨드립니다.",
    description:
      "가정이사 15년 경력의 정하늘입니다. 대구·경북 지역 서비스합니다.",
    profileImageUrl: null,
    rating: 4.95,
    reviewCount: 421,
    careerYears: 15,
    confirmedCount: 789,
    favoriteCount: 401,
  },
  {
    id: "mover-6",
    serviceType: SERVICE_TYPE.OFFICE,
    region: "seoul",
    moverName: "한서준",
    introduction: "사무실·오피스 이전 전문 업체입니다.",
    description: "대형 사무실 이전도 안전하게, 한서준이 책임지고 도와드립니다.",
    profileImageUrl: null,
    rating: 4.6,
    reviewCount: 132,
    careerYears: 8,
    confirmedCount: 245,
    favoriteCount: 98,
  },
  {
    id: "mover-7",
    serviceType: SERVICE_TYPE.SMALL,
    region: "gwangju",
    moverName: "오지은",
    introduction: "1인 가구 이사, 오지은에게 맡겨주세요.",
    description: "원룸·소형 이사 전문으로 광주 전 지역 서비스 가능합니다.",
    profileImageUrl: null,
    rating: 4.85,
    reviewCount: 67,
    careerYears: 4,
    confirmedCount: 95,
    favoriteCount: 41,
  },
  {
    id: "mover-8",
    serviceType: SERVICE_TYPE.HOME,
    region: "gyeonggi",
    moverName: "강태오",
    introduction: "가정이사 전문, 꼼꼼함이 강점입니다.",
    description: "경기 전 지역 가정이사 서비스, 12년 경력의 강태오입니다.",
    profileImageUrl: null,
    rating: 4.9,
    reviewCount: 305,
    careerYears: 12,
    confirmedCount: 560,
    favoriteCount: 210,
  },
  {
    id: "mover-9",
    serviceType: SERVICE_TYPE.OFFICE,
    region: "incheon",
    moverName: "윤소희",
    introduction: "사무실 이사 견적, 투명하게 안내드립니다.",
    description: "인천 지역 사무실 이사 전문, 윤소희입니다.",
    profileImageUrl: null,
    rating: 4.5,
    reviewCount: 54,
    careerYears: 6,
    confirmedCount: 88,
    favoriteCount: 33,
  },
  {
    id: "mover-10",
    serviceType: SERVICE_TYPE.SMALL,
    region: "daejeon",
    moverName: "임도윤",
    introduction: "소형이사 당일 처리, 임도윤이 도와드립니다.",
    description: "대전·세종 지역 원룸·소형 이사 전문입니다.",
    profileImageUrl: null,
    rating: 4.75,
    reviewCount: 143,
    careerYears: 9,
    confirmedCount: 230,
    favoriteCount: 77,
  },
  {
    id: "mover-11",
    serviceType: SERVICE_TYPE.HOME,
    region: "busan",
    moverName: "서지호",
    introduction: "가정이사, 서지호와 함께 안심하고 맡겨주세요.",
    description: "부산·울산 지역 가정이사 전문, 11년 경력입니다.",
    profileImageUrl: null,
    rating: 4.65,
    reviewCount: 176,
    careerYears: 11,
    confirmedCount: 300,
    favoriteCount: 150,
  },
  {
    id: "mover-12",
    serviceType: SERVICE_TYPE.OFFICE,
    region: "gyeongnam",
    moverName: "문가을",
    introduction: "사무실 이전, 꼼꼼하고 신속하게 처리합니다.",
    description: "경남 지역 사무실 이전 전문, 문가을입니다.",
    profileImageUrl: null,
    rating: 4.4,
    reviewCount: 42,
    careerYears: 2,
    confirmedCount: 60,
    favoriteCount: 19,
  },
];

function matchesListParams(
  mover: MoverSearchResult,
  params: MoverSearchListParams,
): boolean {
  const keyword = params.search.trim().toLowerCase();
  if (keyword && !mover.moverName.toLowerCase().includes(keyword)) {
    return false;
  }
  if (params.regions.length > 0 && !params.regions.includes(mover.region)) {
    return false;
  }
  if (
    params.services.length > 0 &&
    !params.services.includes(mover.serviceType)
  ) {
    return false;
  }
  return true;
}

export function queryMockMoverSearchPage(
  params: MoverSearchListParams,
  page: number,
): MoverSearchPageResult {
  const filtered = MOCK_MOVER_SEARCH_RESULTS.filter((mover) =>
    matchesListParams(mover, params),
  );
  const sorted = [...filtered].sort(
    (left, right) => right[params.sort] - left[params.sort],
  );
  const start = (page - 1) * MOVER_SEARCH_PAGE_SIZE;
  const items = sorted.slice(start, start + MOVER_SEARCH_PAGE_SIZE);
  const hasNext = start + items.length < sorted.length;

  return {
    items,
    nextPage: hasNext ? page + 1 : undefined,
    totalCount: sorted.length,
  };
}

export const MOCK_FAVORITE_MOVER_IDS = [
  "mover-3",
  "mover-6",
  "mover-8",
] as const;

export const MOCK_DESIGNATED_MOVER_IDS: string[] = ["mover-5"];

export const MOCK_CUSTOMER_HAS_GENERAL_QUOTE = false;

export const MOCK_DESIGNATED_STORAGE_KEY = "moving-mock-designated-mover-ids";

export function readStoredDesignatedMoverIds(): string[] {
  if (typeof window === "undefined") {
    return [...MOCK_DESIGNATED_MOVER_IDS];
  }

  try {
    const raw = sessionStorage.getItem(MOCK_DESIGNATED_STORAGE_KEY);
    if (!raw) {
      return [...MOCK_DESIGNATED_MOVER_IDS];
    }

    const parsed: unknown = JSON.parse(raw);
    if (
      !Array.isArray(parsed) ||
      parsed.some((value) => typeof value !== "string")
    ) {
      return [...MOCK_DESIGNATED_MOVER_IDS];
    }

    return [...new Set([...MOCK_DESIGNATED_MOVER_IDS, ...parsed])];
  } catch {
    return [...MOCK_DESIGNATED_MOVER_IDS];
  }
}

export function writeStoredDesignatedMoverIds(ids: readonly string[]) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(
    MOCK_DESIGNATED_STORAGE_KEY,
    JSON.stringify([...new Set(ids)]),
  );
}

export function getMoversByIds(ids: readonly string[]): MoverSearchResult[] {
  const moversById = new Map(
    MOCK_MOVER_SEARCH_RESULTS.map((mover) => [mover.id, mover]),
  );

  return ids.flatMap((id) => {
    const mover = moversById.get(id);
    return mover ? [mover] : [];
  });
}

export function getRecommendedMovers(
  limit = SIDEBAR_MOVER_LIMIT,
): MoverSearchResult[] {
  return [...MOCK_MOVER_SEARCH_RESULTS]
    .sort((left, right) => {
      if (right.favoriteCount !== left.favoriteCount) {
        return right.favoriteCount - left.favoriteCount;
      }
      return right.rating - left.rating;
    })
    .slice(0, limit);
}

export function getFavoriteMovers(
  ids: readonly string[],
  limit = SIDEBAR_MOVER_LIMIT,
): MoverSearchResult[] {
  return getMoversByIds(ids).slice(0, limit);
}

const MOVER_1_DETAIL_DESCRIPTION =
  "안녕하세요. 이사업계 경력 7년으로 안전한 이사를 도와드리는 김코드입니다.\n고객님의 물품을 소중하고 안전하게 운송하여 드립니다. 소형이사 및 가정이사 서비스를 제공하며 서비스 가능 지역은 서울과 경기권입니다.";

const EMPTY_RATING_COUNTS = [
  { score: 5 as const, count: 0 },
  { score: 4 as const, count: 0 },
  { score: 3 as const, count: 0 },
  { score: 2 as const, count: 0 },
  { score: 1 as const, count: 0 },
];

const MOCK_MOVER_1_REVIEWS: MoverReview[] = [
  {
    id: "review-1",
    reviewerName: "kim****",
    writtenAt: "2024-07-01",
    rating: 5,
    content:
      "듣던대로 정말 친절하시고 물건도 잘 옮겨주셨어요~~\n나중에 또 짐 옮길 일 있으면 김코드 기사님께 부탁드릴 예정입니다!!\n비 오는데 꼼꼼히 잘 해주셔서 감사드립니다 :)",
  },
  {
    id: "review-2",
    reviewerName: "kim****",
    writtenAt: "2024-07-01",
    rating: 5,
    content: "기사님 안전하고 신속하고 이사했습니다! 정말 감사합니다~!",
  },
  {
    id: "review-3",
    reviewerName: "kim****",
    writtenAt: "2024-07-01",
    rating: 5,
    content: "김코드 기사님 두 번째 견적인데, 항상 친절하시고 정말 좋아요!",
  },
  {
    id: "review-4",
    reviewerName: "kim****",
    writtenAt: "2024-07-01",
    rating: 5,
    content:
      "지인분께 추천받아서 견적 받았어요!\n정말 멀어서 걱정했는데 김코드 덕분에 이사가 수월했어요!\n짐이 많아서 걱정했는데 김코드 덕분에 이사가 수월했어요!",
  },
  {
    id: "review-5",
    reviewerName: "kim****",
    writtenAt: "2024-07-01",
    rating: 5,
    content: "역시 리뷰 나온대로 꼼꼼하세요! 감사합니다 :)",
  },
  {
    id: "review-6",
    reviewerName: "lee****",
    writtenAt: "2024-06-18",
    rating: 4,
    content: "일정에 맞춰 잘 옮겨 주셨어요. 다음에도 부탁드리고 싶습니다.",
  },
  {
    id: "review-7",
    reviewerName: "park****",
    writtenAt: "2024-06-02",
    rating: 4,
    content: "포장과 운반이 꼼꼼했습니다. 소형이사에 잘 맞아요.",
  },
];

const MOCK_MOVER_2_REVIEWS: MoverReview[] = [
  {
    id: "review-office-1",
    reviewerName: "choi****",
    writtenAt: "2024-07-12",
    rating: 5,
    content: "사무실 이전을 주말에 맞춰 잘 진행해 주셨습니다.",
  },
  {
    id: "review-office-2",
    reviewerName: "jung****",
    writtenAt: "2024-06-20",
    rating: 4,
    content: "대형 책상도 안전하게 옮겼어요. 일정 조율이 빨랐습니다.",
  },
];

export function getMockMoverDetail(moverId: string): MoverDetail | null {
  const mover = MOCK_MOVER_SEARCH_RESULTS.find((item) => item.id === moverId);
  if (!mover) {
    return null;
  }

  if (mover.id === "mover-1") {
    return {
      ...mover,
      serviceTypes: [SERVICE_TYPE.SMALL, SERVICE_TYPE.HOME],
      regionValues: ["seoul", "gyeonggi"],
      detailDescription: MOVER_1_DETAIL_DESCRIPTION,
    };
  }

  if (mover.id === "mover-2") {
    return {
      ...mover,
      serviceTypes: [SERVICE_TYPE.OFFICE, SERVICE_TYPE.SMALL],
      regionValues: ["gyeonggi", "seoul"],
      detailDescription:
        "안녕하세요. 사무실 이사 전문 박이사입니다.\n소형이사와 사무실 이전을 함께 진행하며 경기·서울 권역을 다닙니다.",
    };
  }

  if (mover.id === "mover-5") {
    return {
      ...mover,
      serviceTypes: [SERVICE_TYPE.HOME, SERVICE_TYPE.SMALL],
      regionValues: ["daegu", "gyeongbuk"],
      detailDescription:
        "가정이사 15년 경력의 정하늘입니다.\n대구·경북 지역에서 지정 견적 요청이 이미 완료된 상태를 확인할 수 있습니다.",
    };
  }

  return {
    ...mover,
    serviceTypes: [mover.serviceType],
    regionValues: [mover.region],
    detailDescription: mover.description,
  };
}

export function getMockMoverReviews(moverId: string): MoverReviewSummary {
  if (moverId === "mover-1") {
    return {
      reviews: MOCK_MOVER_1_REVIEWS,
      ratingCounts: [
        { score: 5, count: 170 },
        { score: 4, count: 8 },
        { score: 3, count: 0 },
        { score: 2, count: 0 },
        { score: 1, count: 0 },
      ],
    };
  }

  if (moverId === "mover-2") {
    return {
      reviews: MOCK_MOVER_2_REVIEWS,
      ratingCounts: [
        { score: 5, count: 1 },
        { score: 4, count: 1 },
        { score: 3, count: 0 },
        { score: 2, count: 0 },
        { score: 1, count: 0 },
      ],
    };
  }

  return {
    reviews: [],
    ratingCounts: EMPTY_RATING_COUNTS,
  };
}
