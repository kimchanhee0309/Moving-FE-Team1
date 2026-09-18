import type { ReviewScore } from "@/common/components/ReviewProgressBar";

export interface MoverMyPageReview {
  id: string;
  reviewerName: string;
  writtenAt: string;
  rating: number;
  content: string;
}

export interface MoverMyPageData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  nickname: string;
  profileImageUrl: string;
  shortIntroduction: string;
  description: string;
  careerYears: number;
  confirmedCount: number;
  favoriteCount: number;
  rating: number;
  reviewCount: number;
  serviceLabels: string[];
  regionLabels: string[];
  ratingCounts: ReadonlyArray<{ score: ReviewScore; count: number }>;
}

export interface MoverReviewPage {
  items: MoverMyPageReview[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  summary: {
    reviewCount: number;
    averageRating: number | null;
  };
}

export interface MoverBasicInfoFormValues {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
  changedFields?: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
}

export type MoverBasicInfo = Pick<MoverBasicInfoFormValues, "name" | "email" | "phone">;

export interface MoverBasicInfoFormProps {
  initialValues: MoverBasicInfo;
  isPending?: boolean;
  submissionError?: string;
  currentPasswordError?: string;
  onCurrentPasswordChange?: () => void;
  onSubmit: (values: MoverBasicInfoFormValues) => Promise<MoverBasicInfo>;
}
