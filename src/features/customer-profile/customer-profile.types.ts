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
