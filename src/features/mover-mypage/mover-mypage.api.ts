import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { apiClient } from "@/common/api/client";
import { MOVER_MY_PAGE_QUERY_KEY } from "@/common/api/query-keys";
import { createApiResponseReader } from "@/common/api/response-reader";
import type { ReviewScore } from "@/common/components/ReviewProgressBar";
import { PROFILE_SERVICE_OPTIONS } from "@/common/constants/profile";
import { normalizeEmail, normalizePhoneDigits } from "@/common/validation/contact";

import type {
  MoverBasicInfoFormValues,
  MoverBasicInfo,
  MoverMyPageData,
  MoverMyPageReview,
  MoverReviewPage,
} from "./mover-mypage.types";

const DEFAULT_PROFILE_IMAGE = "/images/mover-profile-placeholder.png";

export const moverMyPageKeys = {
  all: MOVER_MY_PAGE_QUERY_KEY,
  detail: () => [...moverMyPageKeys.all, "detail"] as const,
  reviews: (page: number, pageSize: number) => [...moverMyPageKeys.all, "reviews", page, pageSize] as const,
};

const response = createApiResponseReader("기사님 마이페이지 응답 형식이 올바르지 않습니다.");

function isReviewScore(value: unknown): value is ReviewScore {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function readMyPage(data: unknown): MoverMyPageData {
  if (!response.isRecord(data) || !response.isRecord(data.myPage)) return response.invalid();
  const myPage = data.myPage;
  const ratingCounts = myPage.ratingCounts;
  if (!Array.isArray(ratingCounts)) return response.invalid();

  const serviceTypes = response.stringArray(myPage.serviceTypes);
  return {
    id: response.string(myPage.id),
    name: response.string(myPage.name),
    email: response.string(myPage.email),
    phone: response.nullableString(myPage.phone),
    nickname: response.string(myPage.nickname),
    profileImageUrl: resolveApiAssetUrl(response.nullableString(myPage.profileImageUrl)) ?? DEFAULT_PROFILE_IMAGE,
    shortIntroduction: response.string(myPage.shortIntroduction),
    description: response.string(myPage.description),
    careerYears: response.number(myPage.careerYears),
    confirmedCount: response.number(myPage.confirmedCount),
    favoriteCount: response.number(myPage.favoriteCount),
    rating: response.number(myPage.rating),
    reviewCount: response.number(myPage.reviewCount),
    serviceLabels: serviceTypes.map((serviceType) =>
      PROFILE_SERVICE_OPTIONS.find((option) => option.value === serviceType)?.label ?? serviceType,
    ),
    regionLabels: response.stringArray(myPage.regions),
    ratingCounts: ratingCounts.map((item) => {
      if (!response.isRecord(item) || !isReviewScore(item.score)) return response.invalid();
      return { score: item.score, count: response.number(item.count) };
    }),
  };
}

function readReview(value: unknown): MoverMyPageReview {
  if (!response.isRecord(value) || !response.isRecord(value.customer)) return response.invalid();
  const createdAt = response.string(value.createdAt);
  return {
    id: response.string(value.id),
    reviewerName: response.string(value.customer.name),
    writtenAt: createdAt.slice(0, 10).replaceAll("-", "."),
    rating: response.number(value.rating),
    content: response.string(value.content),
  };
}

function readReviewPage(data: unknown): MoverReviewPage {
  if (!response.isRecord(data) || !Array.isArray(data.items) || !response.isRecord(data.pagination) || !response.isRecord(data.summary)) {
    return response.invalid();
  }
  return {
    items: data.items.map(readReview),
    pagination: {
      page: response.number(data.pagination.page),
      pageSize: response.number(data.pagination.pageSize),
      totalCount: response.number(data.pagination.totalCount),
      totalPages: response.number(data.pagination.totalPages),
    },
    summary: {
      reviewCount: response.number(data.summary.reviewCount),
      averageRating: data.summary.averageRating === null ? null : response.number(data.summary.averageRating),
    },
  };
}

function readBasicInfo(data: unknown): MoverBasicInfo {
  if (!response.isRecord(data) || !response.isRecord(data.basicInfo)) return response.invalid();
  return {
    name: response.string(data.basicInfo.name),
    email: response.string(data.basicInfo.email),
    phone: response.nullableString(data.basicInfo.phone) ?? "",
  };
}

export async function getMoverMyPage(signal?: AbortSignal): Promise<MoverMyPageData> {
  return readMyPage(await apiClient<unknown>("/movers/me", { signal, cache: "no-store" }));
}

export async function getMoverReviews(page: number, pageSize: number, signal?: AbortSignal): Promise<MoverReviewPage> {
  return readReviewPage(await apiClient<unknown>("/movers/me/reviews", {
    query: { page, pageSize },
    signal,
    cache: "no-store",
  }));
}

export async function updateMoverBasicInfo(
  values: MoverBasicInfoFormValues,
): Promise<MoverBasicInfo> {
  const payload: Record<string, string | null> = {};
  const changed = values.changedFields;
  if (!changed || changed.name) payload.name = values.name.trim();
  if (!changed || changed.email) payload.email = normalizeEmail(values.email);
  if (!changed || changed.phone) {
    payload.phone = values.phone.trim() ? normalizePhoneDigits(values.phone) : null;
  }
  if (values.currentPassword && (!changed || changed.email || values.newPassword)) {
    payload.currentPassword = values.currentPassword;
  }
  if (values.newPassword) payload.newPassword = values.newPassword;
  return readBasicInfo(await apiClient<unknown>("/movers/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }));
}
