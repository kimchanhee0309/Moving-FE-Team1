import type { ReviewProgressBarProps } from "./ReviewProgressBar.types";

/**
 * 기사님 마이페이지의 별점별 리뷰 분포 한 행을 표현합니다.
 * 전체 차트의 정렬과 API 데이터 변환은 호출부가 담당합니다.
 */
export function ReviewProgressBar({
  score,
  count,
  maxCount,
  isLoading = false,
  className,
}: ReviewProgressBarProps) {
  const safeCount = Math.max(0, count);
  const safeMaxCount = Math.max(0, maxCount);
  const accessibleMaxCount = Math.max(safeMaxCount, 1);
  const ratio = safeMaxCount === 0 ? 0 : Math.min(safeCount / safeMaxCount, 1);
  const percentage = ratio * 100;

  if (isLoading) {
    return (
      <div
        className={["flex h-6 w-full max-w-[284px] animate-pulse items-center gap-4", className]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-label={`${score}점 리뷰 분포를 불러오는 중`}
        aria-busy="true"
      >
        <span className="h-5 w-9 rounded bg-[var(--background-300)]" />
        <span className="h-2 w-[180px] rounded-full bg-[var(--background-300)]" />
        <span className="h-5 w-9 rounded bg-[var(--background-300)]" />
      </div>
    );
  }

  return (
    <div
      className={["flex h-6 w-full max-w-[284px] items-center gap-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-md-medium w-9 shrink-0 text-[var(--black-300)]">
        {score}점
      </span>
      <span
        role="progressbar"
        aria-label={`${score}점 리뷰 ${safeCount}개`}
        aria-valuemin={0}
        aria-valuemax={accessibleMaxCount}
        aria-valuenow={safeCount}
        className="h-2 w-[180px] shrink-0 overflow-hidden rounded-full bg-[var(--background-300)]"
      >
        <span
          className="block h-full rounded-full bg-[var(--secondary-yellow-100)]"
          style={{ width: `${percentage}%` }}
        />
      </span>
      <span className="text-md-medium w-9 shrink-0 text-right text-[var(--gray-400)]">
        {safeCount.toLocaleString("ko-KR")}
      </span>
    </div>
  );
}
