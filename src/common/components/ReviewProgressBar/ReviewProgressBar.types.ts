export type ReviewScore = 1 | 2 | 3 | 4 | 5;

export interface ReviewProgressBarProps {
  /** 표시할 별점 구간입니다. */
  score: ReviewScore;
  /** 해당 별점의 리뷰 개수입니다. */
  count: number;
  /** 가장 많은 별점 구간의 개수이며 채움 비율 계산 기준입니다. */
  maxCount: number;
  isLoading?: boolean;
  className?: string;
}
