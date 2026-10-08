"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

export interface CopyLinkToastProps {
  isVisible: boolean;
  onClose?: () => void;
  className?: string;
  /** 생략하면 기존 "링크가 복사되었어요" 문구를 씁니다. 찜 완료 등 다른 성공 메시지에도 재사용합니다. */
  message?: string;
}

const AUTO_CLOSE_DELAY_MS = 3000;

/**
 * 짧은 성공 메시지를 보여주는 토스트입니다. 기본은 링크 복사 문구이며, 기사님 찾기·견적
 * 상세 공유에서 재사용합니다. `message`를 넘기면 찜 완료/해제 등 다른 성공 토스트로도
 * 그대로 재사용할 수 있습니다. 표시/숨김 타이밍만 담당하며 클립보드 API는 호출하지 않습니다.
 */
export function CopyLinkToast({
  isVisible,
  onClose,
  className,
  message,
}: CopyLinkToastProps) {
  const t = useTranslations("Common");

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timer = setTimeout(() => {
      onClose?.();
    }, AUTO_CLOSE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  return (
    <div
      className={[
        "pointer-events-none fixed inset-x-0 top-[71px] z-[1000] flex justify-center px-5 transition-opacity duration-300",
        "min-[1024px]:top-[105px] min-[1200px]:top-[104px]",
        isVisible ? "opacity-100" : "opacity-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!isVisible}
    >
      <div
        role="status"
        aria-live="polite"
        className={[
          "w-full max-w-[640px] rounded-xl bg-[var(--primary-200)] px-6 py-3.5",
          "shadow-[-2px_-2px_10px_rgba(46,46,46,0.04),2px_2px_10px_rgba(46,46,46,0.04)]",
          "min-[1200px]:max-w-[1200px] min-[1200px]:rounded-2xl min-[1200px]:px-8 min-[1200px]:py-5",
        ].join(" ")}
      >
        <p className="text-lg-semibold whitespace-nowrap text-[var(--primary-400)] min-[1200px]:text-2lg-semibold">
          {message ?? t("linkCopied")}
        </p>
      </div>
    </div>
  );
}
