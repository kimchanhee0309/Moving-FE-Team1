import { SERVICE_TYPE } from "@/common/constants/domain";

import {
  MOVER_SEARCH_PAGE_SIZE,
  SIDEBAR_MOVER_LIMIT,
} from "./mover-search.constants";
import type {
  MoverSearchListParams,
  MoverSearchPageResult,
  MoverSearchResult,
} from "./mover-search.types";

/**
 * TODO(mover-search): `GET /movers`가 확정되면 이 mock 배열과 클라이언트 필터/정렬/페이지네이션을
 * 실제 API 호출(TanStack Query `useInfiniteQuery`)로 교체합니다.
 * favoriteCount는 사이드바의 "추천 기사님"(찜 많은 순) 정렬을 검증하기 위해 값을 서로 다르게 구성했습니다.
 */
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

/**
 * mock 목록을 검색·필터·정렬한 뒤 페이지 단위로 잘라 반환합니다.
 * 실제 `GET /movers`가 붙으면 이 함수 호출을 API 레이어로 교체합니다.
 */
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

/**
 * 로그인 일반 유저의 찜 사이드바 UI를 검증하기 위한 초기 id입니다.
 * 추천(찜 수 상위)과 목록이 달라야 분기가 눈에 보입니다.
 * TODO(mover-search): `GET /favorites` 확정 후 이 배열과 클라이언트 토글을 API로 교체합니다.
 */
export const MOCK_FAVORITE_MOVER_IDS = [
  "mover-1",
  "mover-6",
  "mover-8",
] as const;

/** id 순서를 유지한 채 mock 목록에서 기사님을 찾습니다. 없는 id는 건너뜁니다. */
export function getMoversByIds(ids: readonly string[]): MoverSearchResult[] {
  const moversById = new Map(
    MOCK_MOVER_SEARCH_RESULTS.map((mover) => [mover.id, mover]),
  );

  return ids.flatMap((id) => {
    const mover = moversById.get(id);
    return mover ? [mover] : [];
  });
}

/** 비로그인·기사님 사이드바용. 기존 사용자의 찜 수 기준 상위 N명입니다. */
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

/** 로그인 일반 유저 사이드바용. 찜 id 앞쪽 N명만 보여 줍니다. */
export function getFavoriteMovers(
  ids: readonly string[],
  limit = SIDEBAR_MOVER_LIMIT,
): MoverSearchResult[] {
  return getMoversByIds(ids).slice(0, limit);
}
