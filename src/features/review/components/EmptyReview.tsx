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

export function EmptyReview({
  message,
  actionLabel,
  href,
  className,
}: EmptyReviewProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 min-[558px]:gap-8",
        className,
      )}
    >
      <div className="relative h-[196px] w-[240px] shrink-0 overflow-hidden bg-transparent">
        {/* Figma: 클립 + opacity 50% (배경은 투명 PNG) */}
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
          "text-lg-regular text-center whitespace-nowrap text-[var(--input-placeholder)]",
          "min-[558px]:text-2xl-regular",
        )}
      >
        {message}
      </p>

      {actionLabel && href ? (
        <Link
          href={href}
          className={cn(
            /* reset.css a 초기화보다 우선 */
            "flex h-[54px] items-center justify-center rounded-xl bg-[var(--primary-400)]! p-4",
            "text-lg-semibold text-[var(--gray-50)]!",
            "min-[558px]:h-16 min-[558px]:rounded-2xl min-[558px]:text-2lg-semibold",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--black-400)]",
          )}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
