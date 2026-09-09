import type { ServiceType } from "@/common/constants/domain";
import type { ProfileRegion } from "@/common/constants/profile";

export interface MoverProfileFormValues {
  profileImage: File | null;
  nickname: string;
  careerYears: string;
  shortIntroduction: string;
  description: string;
  serviceTypeIds: ServiceType[];
  regions: ProfileRegion[];
}

export interface MoverProfileFormProps {
  mode: "register" | "edit";
  initialValues?: Omit<MoverProfileFormValues, "profileImage"> & {
    profileImageUrl?: string;
  };
  isLoading?: boolean;
  submissionError?: string;
  onSubmit?: (values: MoverProfileFormValues) => Promise<void>;
}
