import { resolveApiAssetUrl } from "@/common/api/asset-url";
import { apiClient } from "@/common/api/client";
import { createApiResponseReader } from "@/common/api/response-reader";
import { isServiceType, type ServiceType } from "@/common/constants/domain";
import { isProfileRegion } from "@/common/constants/profile";
import { normalizeEmail, normalizePhoneDigits } from "@/common/validation/contact";

import type {
  CustomerProfile,
  CustomerProfileEditFormValues,
  CustomerProfileFormValues,
} from "./customer-profile.types";

export const customerProfileKeys = {
  all: ["customer-profile"] as const,
  current: () => [...customerProfileKeys.all, "current"] as const,
};

const response = createApiResponseReader("일반 유저 프로필 응답 형식이 올바르지 않습니다.");

function readServiceTypes(value: unknown): ServiceType[] {
  if (!Array.isArray(value) || !value.every(isServiceType)) return response.invalid();
  return value;
}

function readProfile(data: unknown): CustomerProfile {
  if (!response.isRecord(data) || !response.isRecord(data.profile)) return response.invalid();
  const profile = data.profile;
  const region = profile.region;
  if (!isProfileRegion(region)) return response.invalid();

  return {
    id: response.string(profile.id),
    name: response.string(profile.name),
    email: response.string(profile.email),
    phone: response.nullableString(profile.phone),
    profileImageUrl: resolveApiAssetUrl(response.nullableString(profile.profileImageUrl)),
    serviceTypes: readServiceTypes(profile.serviceTypes),
    region,
    createdAt: response.string(profile.createdAt),
    updatedAt: response.string(profile.updatedAt),
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
  const changed = values.changedFields;
  if (values.profileImage) formData.append("profileImage", values.profileImage);
  if (!changed || changed.serviceTypeIds) {
    values.serviceTypeIds.forEach((serviceType) => formData.append("serviceTypes", serviceType));
  }
  if ((!changed || changed.region) && values.region) formData.append("region", values.region);
  if (!changed || changed.name) formData.append("name", values.name.trim());
  if (!changed || changed.email) formData.append("email", normalizeEmail(values.email));
  if (!changed || changed.phone) formData.append("phone", normalizePhoneDigits(values.phone));
  if (values.currentPassword) formData.append("currentPassword", values.currentPassword);
  if (values.newPassword) formData.append("newPassword", values.newPassword);
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
