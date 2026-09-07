import Image from "next/image";

import type {
  ReviewListCardProps,
  ReviewListCardSize,
} from "./ReviewListCard.types";

const STAR_NUMBERS = [1, 2, 3, 4, 5] as const;

const SIZE_CLASS: Record<ReviewListCardSize, string> = {
  // Figma sm: 600px, 상하 20px, 본문 간격 16px.
  sm: "max-w-[600px] gap-4 py-5",
  // lg는 1200px 미만에서 sm 간격을 사용해 모바일·태블릿 가로 넘침을 방지합니다.
  lg: "max-w-[600px] gap-4 py-5 min-[1200px]:max-w-[955px] min-[1200px]:gap-6 min-[1200px]:py-6",
};

/**
 * 기사님이 받은 리뷰 한 건을 보여주는 정적 카드입니다.
 * 수정·삭제 동작과 페이지네이션은 소유하지 않으며, 기존 공용 별 아이콘을 재사용합니다.
 */
export function ReviewListCard({
  reviewerName,
  writtenAt,
  rating,
  content,
  size = "sm",
  isLoading = false,
  className,
}: ReviewListCardProps) {
  const safeRating = Math.min(Math.max(Math.round(rating), 0), STAR_NUMBERS.length);

  if (isLoading) {
    return (
      <article
        className={[
          "flex w-full animate-pulse flex-col border-b border-[var(--line-200)] bg-[var(--gray-50)]",
          SIZE_CLASS[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="리뷰를 불러오는 중"
        aria-busy="true"
      >
        <div className="flex flex-col gap-2">
          <div className="h-5 w-44 rounded bg-[var(--background-300)]" />
          <div className="h-5 w-28 rounded bg-[var(--background-300)]" />
        </div>
        <div className="h-6 w-full rounded bg-[var(--background-300)]" />
      </article>
    );
  }

  return (
    <article
      className={[
        "flex w-full flex-col border-b border-[var(--line-200)] bg-[var(--gray-50)]",
        SIZE_CLASS[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-md-medium text-[var(--black-500)]">{reviewerName}</h3>
          <time dateTime={writtenAt} className="text-xs-regular text-[var(--gray-400)]">
            {writtenAt}
          </time>
        </div>

        <div
          className="flex items-center gap-0.5"
          aria-label={`평점 ${safeRating}점`}
        >
          {STAR_NUMBERS.map((starNumber) => (
            <Image
              key={starNumber}
              src="/icons/ic-star.svg"
              alt=""
              width={20}
              height={20}
              className={`size-5 ${starNumber > safeRating ? "grayscale opacity-25" : ""}`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <p className="text-md-regular whitespace-pre-line text-[var(--black-400)]">
        {content}
      </p>
    </article>
  );
}
