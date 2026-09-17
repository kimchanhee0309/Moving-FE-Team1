import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { apiClient } from "@/common/api/client";
import { ApiError } from "@/common/api/error";
import type { ReviewScore } from "@/common/components/ReviewProgressBar";
import { PROFILE_SERVICE_OPTIONS } from "@/common/constants/profile";

import type {
  MoverBasicInfoFormValues,
  MoverMyPageData,
  MoverMyPageReview,
  MoverReviewPage,
} from "./mover-mypage.types";

const DEFAULT_PROFILE_IMAGE = "/images/mover-profile-placeholder.png";

export const moverMyPageKeys = {
  all: ["mover-mypage"] as const,
  detail: () => [...moverMyPageKeys.all, "detail"] as const,
  reviews: (page: number, pageSize: number) => [...moverMyPageKeys.all, "reviews", page, pageSize] as const,
};

function invalidResponse(): never {
  throw new ApiError(200, "INVALID_RESPONSE", "기사님 마이페이지 응답 형식이 올바르지 않습니다.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  if (typeof value !== "string") return invalidResponse();
  return value;
}

function readNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return invalidResponse();
  return value;
}

function readNullableString(value: unknown): string | null {
  if (value !== null && typeof value !== "string") return invalidResponse();
  return value;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) return invalidResponse();
  return value;
}

function isReviewScore(value: unknown): value is ReviewScore {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function readMyPage(data: unknown): MoverMyPageData {
  if (!isRecord(data) || !isRecord(data.myPage)) return invalidResponse();
  const myPage = data.myPage;
  const ratingCounts = myPage.ratingCounts;
  if (!Array.isArray(ratingCounts)) return invalidResponse();

  const serviceTypes = readStringArray(myPage.serviceTypes);
  return {
    id: readString(myPage.id),
    name: readString(myPage.name),
    email: readString(myPage.email),
    phone: readNullableString(myPage.phone),
    nickname: readString(myPage.nickname),
    profileImageUrl: resolveApiAssetUrl(readNullableString(myPage.profileImageUrl)) ?? DEFAULT_PROFILE_IMAGE,
    shortIntroduction: readString(myPage.shortIntroduction),
    description: readString(myPage.description),
    careerYears: readNumber(myPage.careerYears),
    confirmedCount: readNumber(myPage.confirmedCount),
    favoriteCount: readNumber(myPage.favoriteCount),
    rating: readNumber(myPage.rating),
    reviewCount: readNumber(myPage.reviewCount),
    serviceLabels: serviceTypes.map((serviceType) =>
      PROFILE_SERVICE_OPTIONS.find((option) => option.value === serviceType)?.label ?? serviceType,
    ),
    regionLabels: readStringArray(myPage.regions),
    ratingCounts: ratingCounts.map((item) => {
      if (!isRecord(item) || !isReviewScore(item.score)) return invalidResponse();
      return { score: item.score, count: readNumber(item.count) };
    }),
  };
}

function readReview(value: unknown): MoverMyPageReview {
  if (!isRecord(value) || !isRecord(value.customer)) return invalidResponse();
  const createdAt = readString(value.createdAt);
  return {
    id: readString(value.id),
    reviewerName: readString(value.customer.name),
    writtenAt: createdAt.slice(0, 10).replaceAll("-", "."),
    rating: readNumber(value.rating),
    content: readString(value.content),
  };
}

function readReviewPage(data: unknown): MoverReviewPage {
  if (!isRecord(data) || !Array.isArray(data.items) || !isRecord(data.pagination) || !isRecord(data.summary)) {
    return invalidResponse();
  }
  return {
    items: data.items.map(readReview),
    pagination: {
      page: readNumber(data.pagination.page),
      pageSize: readNumber(data.pagination.pageSize),
      totalCount: readNumber(data.pagination.totalCount),
      totalPages: readNumber(data.pagination.totalPages),
    },
    summary: {
      reviewCount: readNumber(data.summary.reviewCount),
      averageRating: data.summary.averageRating === null ? null : readNumber(data.summary.averageRating),
    },
  };
}

function readBasicInfo(data: unknown): Pick<MoverBasicInfoFormValues, "name" | "email" | "phone"> {
  if (!isRecord(data) || !isRecord(data.basicInfo)) return invalidResponse();
  return {
    name: readString(data.basicInfo.name),
    email: readString(data.basicInfo.email),
    phone: readNullableString(data.basicInfo.phone) ?? "",
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
): Promise<Pick<MoverBasicInfoFormValues, "name" | "email" | "phone">> {
  const payload: Record<string, string | null> = {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim() ? values.phone.replace(/[-\s]/g, "") : null,
  };
  if (values.currentPassword && values.newPassword) {
    payload.currentPassword = values.currentPassword;
    payload.newPassword = values.newPassword;
  }
  return readBasicInfo(await apiClient<unknown>("/movers/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  }));
}
