import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { apiClient } from "@/common/api/client";
import { createApiResponseReader } from "@/common/api/response-reader";
import { isServiceType, type ServiceType } from "@/common/constants/domain";
import { isProfileRegion, type ProfileRegion } from "@/common/constants/profile";

import type { MoverProfile, MoverProfileFormValues } from "./mover-profile.types";

export const moverProfileKeys = {
  all: ["mover-profile"] as const,
  current: () => [...moverProfileKeys.all, "current"] as const,
};

const response = createApiResponseReader("기사님 프로필 응답 형식이 올바르지 않습니다.");

function readServiceTypes(value: unknown): ServiceType[] {
  if (!Array.isArray(value) || !value.every(isServiceType)) return response.invalid();
  return value;
}

function readRegions(value: unknown): ProfileRegion[] {
  if (!Array.isArray(value) || !value.every(isProfileRegion)) return response.invalid();
  return value;
}

function readProfile(data: unknown): MoverProfile {
  if (!response.isRecord(data) || !response.isRecord(data.profile)) return response.invalid();
  const profile = data.profile;
  return {
    id: response.string(profile.id),
    profileImageUrl: resolveApiAssetUrl(response.nullableString(profile.profileImageUrl)),
    nickname: response.string(profile.nickname),
    careerYears: response.number(profile.careerYears),
    shortIntroduction: response.string(profile.shortIntroduction),
    description: response.string(profile.description),
    serviceTypes: readServiceTypes(profile.serviceTypes),
    regions: readRegions(profile.regions),
    createdAt: response.string(profile.createdAt),
    updatedAt: response.string(profile.updatedAt),
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
