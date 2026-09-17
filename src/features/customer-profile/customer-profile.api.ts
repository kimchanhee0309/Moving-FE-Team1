import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { apiClient } from "@/common/api/client";
import { ApiError } from "@/common/api/error";
import { isServiceType, type ServiceType } from "@/common/constants/domain";
import { isProfileRegion } from "@/common/constants/profile";

import type {
  CustomerProfile,
  CustomerProfileEditFormValues,
  CustomerProfileFormValues,
} from "./customer-profile.types";

export const customerProfileKeys = {
  all: ["customer-profile"] as const,
  current: () => [...customerProfileKeys.all, "current"] as const,
};

function invalidResponse(): never {
  throw new ApiError(200, "INVALID_RESPONSE", "일반 유저 프로필 응답 형식이 올바르지 않습니다.");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string {
  if (typeof value !== "string") return invalidResponse();
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

function readProfile(data: unknown): CustomerProfile {
  if (!isRecord(data) || !isRecord(data.profile)) return invalidResponse();
  const profile = data.profile;
  const region = profile.region;
  if (!isProfileRegion(region)) return invalidResponse();

  return {
    id: readString(profile.id),
    name: readString(profile.name),
    email: readString(profile.email),
    phone: readNullableString(profile.phone),
    profileImageUrl: resolveApiAssetUrl(readNullableString(profile.profileImageUrl)),
    serviceTypes: readServiceTypes(profile.serviceTypes),
    region,
    createdAt: readString(profile.createdAt),
    updatedAt: readString(profile.updatedAt),
  };
}

function appendProfileFields(formData: FormData, values: CustomerProfileFormValues): void {
  if (values.profileImage) formData.append("profileImage", values.profileImage);
  values.serviceTypeIds.forEach((serviceType) => formData.append("serviceTypes", serviceType));
  if (values.region) formData.append("region", values.region);
}

export async function getCustomerProfile(signal?: AbortSignal): Promise<CustomerProfile> {
  return readProfile(await apiClient<unknown>("/customers/me/profile", { signal, cache: "no-store" }));
}

export async function createCustomerProfile(values: CustomerProfileFormValues): Promise<CustomerProfile> {
  const formData = new FormData();
  appendProfileFields(formData, values);
  return readProfile(await apiClient<unknown>("/customers/me/profile", { method: "POST", body: formData }));
}

export async function updateCustomerProfile(values: CustomerProfileEditFormValues): Promise<CustomerProfile> {
  const formData = new FormData();
  appendProfileFields(formData, values);
  formData.append("name", values.name.trim());
  formData.append("email", values.email.trim().toLowerCase());
  formData.append("phone", values.phone.replace(/[-\s]/g, ""));
  if (values.currentPassword && values.newPassword) {
    formData.append("currentPassword", values.currentPassword);
    formData.append("newPassword", values.newPassword);
  }
  return readProfile(await apiClient<unknown>("/customers/me/profile", { method: "PATCH", body: formData }));
}

export function toCustomerEditInitialValues(profile: CustomerProfile) {
  return {
    profileImageUrl: profile.profileImageUrl,
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? "",
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
    serviceTypeIds: profile.serviceTypes,
    region: profile.region,
  };
}
