import type { ServiceType } from "@/common/constants/domain";
import type { ProfileRegion } from "@/common/constants/profile";

export interface CustomerProfileFormValues {
  profileImage: File | null;
  serviceTypeIds: ServiceType[];
  region: ProfileRegion | null;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profileImageUrl: string | null;
  serviceTypes: ServiceType[];
  region: ProfileRegion;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfileFormProps {
  mode: "register" | "edit";
  initialValues?: Omit<CustomerProfileFormValues, "profileImage"> & {
    profileImageUrl?: string | null;
  };
  isLoading?: boolean;
  submissionError?: string;
  onSubmit: (values: CustomerProfileFormValues) => Promise<void>;
}

export interface CustomerProfileEditFormValues extends CustomerProfileFormValues {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface CustomerProfileEditFormProps {
  initialValues: Omit<CustomerProfileEditFormValues, "profileImage"> & {
    profileImageUrl?: string | null;
  };
  isPending?: boolean;
  submissionError?: string;
  onSubmit: (values: CustomerProfileEditFormValues) => Promise<void>;
}
