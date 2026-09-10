import Image from "next/image";
import Link from "next/link";

const CHARACTER_IMAGE = "/images/empty-review-character.png";

type ClassValue = string | false | null | undefined;

function cn(...classNames: ClassValue[]) {
  return classNames.filter(Boolean).join(" ");
}

export interface EmptyReviewProps {
  message: string;
  actionLabel?: string;
  href?: string;
  className?: string;
}

/**
 * 리뷰 empty 상태입니다.
 * Figma Component/empty: CTA는 호출부가 label·href를 줄 때만 노출합니다.
 * (작성 가능 empty는 CTA opacity 0 → action 미전달)
 * 페이지 인스턴스 CTA 폭: Mobile/Tablet 240 · Desktop 253
 */
export function EmptyReview({
  message,
  actionLabel,
  href,
  className,
}: EmptyReviewProps) {
  return (
    <div
      className={cn(
        // 캐릭터 240 기준 스택 폭 · Desktop은 문구 폭(253)에 맞춤
        "flex w-[240px] flex-col items-center gap-6 min-[1200px]:w-[253px] min-[1200px]:gap-8",
        className,
      )}
    >
      <div className="relative h-[196px] w-[240px] shrink-0 overflow-hidden bg-transparent">
        <div className="absolute left-[-11.04px] top-[-16.29px] size-[260.633px] opacity-50">
          <Image
            src={CHARACTER_IMAGE}
            alt=""
            fill
            sizes="261px"
            className="object-contain"
            priority
            unoptimized
          />
        </div>
      </div>

      <p
        className={cn(
          "text-center whitespace-nowrap text-[var(--input-placeholder)]",
          "text-[16px] leading-[26px] font-normal",
          "min-[1200px]:text-[24px] min-[1200px]:leading-8",
        )}
      >
        {message}
      </p>

      {actionLabel && href ? (
        <Link
          href={href}
          className={cn(
            // Figma 페이지 인스턴스: M/T 240×54 radius12 · D 253×64 radius16
            "box-border flex h-[54px] w-full shrink-0 items-center justify-center",
            "rounded-[12px] bg-[var(--primary-400)]! px-4",
            "text-[16px] leading-[26px] font-semibold whitespace-nowrap text-[var(--gray-50)]!",
            "min-[1200px]:h-16 min-[1200px]:rounded-[16px] min-[1200px]:text-[18px]",
            "transition-colors hover:bg-[#e04829]!",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
          )}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
