import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { apiClient } from "@/common/api/client";
import { ApiError } from "@/common/api/error";
import { isServiceType, type ServiceType } from "@/common/constants/domain";
import { isProfileRegion, type ProfileRegion } from "@/common/constants/profile";

import type { MoverProfile, MoverProfileFormValues } from "./mover-profile.types";

export const moverProfileKeys = {
  all: ["mover-profile"] as const,
  current: () => [...moverProfileKeys.all, "current"] as const,
};

function invalidResponse(): never {
  throw new ApiError(200, "INVALID_RESPONSE", "기사님 프로필 응답 형식이 올바르지 않습니다.");
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

function readServiceTypes(value: unknown): ServiceType[] {
  if (!Array.isArray(value) || !value.every(isServiceType)) return invalidResponse();
  return value;
}

function readRegions(value: unknown): ProfileRegion[] {
  if (!Array.isArray(value) || !value.every(isProfileRegion)) return invalidResponse();
  return value;
}

function readProfile(data: unknown): MoverProfile {
  if (!isRecord(data) || !isRecord(data.profile)) return invalidResponse();
  const profile = data.profile;
  return {
    id: readString(profile.id),
    profileImageUrl: resolveApiAssetUrl(readNullableString(profile.profileImageUrl)),
    nickname: readString(profile.nickname),
    careerYears: readNumber(profile.careerYears),
    shortIntroduction: readString(profile.shortIntroduction),
    description: readString(profile.description),
    serviceTypes: readServiceTypes(profile.serviceTypes),
    regions: readRegions(profile.regions),
    createdAt: readString(profile.createdAt),
    updatedAt: readString(profile.updatedAt),
  };
}

function createProfileFormData(values: MoverProfileFormValues): FormData {
  const formData = new FormData();
  if (values.profileImage) formData.append("profileImage", values.profileImage);
  formData.append("nickname", values.nickname.trim());
  formData.append("careerYears", values.careerYears.trim());
  formData.append("shortIntroduction", values.shortIntroduction.trim());
  formData.append("description", values.description.trim());
  values.serviceTypeIds.forEach((serviceType) => formData.append("serviceTypes", serviceType));
  values.regions.forEach((region) => formData.append("regions", region));
  return formData;
}

export async function getMoverProfile(signal?: AbortSignal): Promise<MoverProfile> {
  return readProfile(await apiClient<unknown>("/movers/me/profile", { signal, cache: "no-store" }));
}

export async function createMoverProfile(values: MoverProfileFormValues): Promise<MoverProfile> {
  return readProfile(await apiClient<unknown>("/movers/me/profile", {
    method: "POST",
    body: createProfileFormData(values),
  }));
}

export async function updateMoverProfile(values: MoverProfileFormValues): Promise<MoverProfile> {
  return readProfile(await apiClient<unknown>("/movers/me/profile", {
    method: "PATCH",
    body: createProfileFormData(values),
  }));
}

export function toMoverProfileInitialValues(profile: MoverProfile) {
  return {
    profileImageUrl: profile.profileImageUrl,
    nickname: profile.nickname,
    careerYears: String(profile.careerYears),
    shortIntroduction: profile.shortIntroduction,
    description: profile.description,
    serviceTypeIds: profile.serviceTypes,
    regions: profile.regions,
  };
}
