import type { ServiceType } from "@/common/constants/domain";
import type { ProfileRegion } from "@/common/constants/profile";

export interface CustomerProfileFormValues {
  profileImage: File | null;
  serviceTypeIds: ServiceType[];
  region: ProfileRegion | null;
}

export interface CustomerProfileFormProps {
  mode: "register" | "edit";
  initialValues?: Omit<CustomerProfileFormValues, "profileImage"> & {
    profileImageUrl?: string;
  };
  isLoading?: boolean;
  submissionError?: string;
  onSubmit?: (values: CustomerProfileFormValues) => Promise<void>;
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
    profileImageUrl?: string;
  };
  isPending?: boolean;
  submissionError?: string;
  onSubmit?: (values: CustomerProfileEditFormValues) => Promise<void>;
}
