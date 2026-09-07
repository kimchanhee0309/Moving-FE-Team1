export type ReviewListCardSize = "sm" | "lg";

export interface ReviewListCardProps {
  reviewerName: string;
  writtenAt: string;
  /** 0~5 범위의 평점이며 범위를 벗어난 값은 안전하게 보정됩니다. */
  rating: number;
  content: string;
  /** Figma Card-list-review의 600px·955px 레이아웃 변형입니다. lg도 1200px 미만에서는 sm 간격으로 축소됩니다. */
  size?: ReviewListCardSize;
  isLoading?: boolean;
  className?: string;
}
