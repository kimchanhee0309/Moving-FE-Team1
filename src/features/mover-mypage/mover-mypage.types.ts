import type { ReviewScore } from "@/common/components/ReviewProgressBar";

export interface MoverMyPageReview {
  id: string;
  reviewerName: string;
  writtenAt: string;
  rating: number;
  content: string;
}

export interface MoverMyPageData {
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
  reviews: MoverMyPageReview[];
}

export type MoverMyPageViewState = "ready" | "loading" | "error" | "empty";

export interface MoverBasicInfoFormValues {
  name: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export interface MoverBasicInfoFormProps {
  initialValues?: Pick<MoverBasicInfoFormValues, "name" | "email" | "phone">;
  isPending?: boolean;
  submissionError?: string;
  onSubmit?: (values: MoverBasicInfoFormValues) => Promise<void>;
}
