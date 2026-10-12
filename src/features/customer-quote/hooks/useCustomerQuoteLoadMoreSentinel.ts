"use client";

import { useEffect, useRef } from "react";

/** 목록 하단 sentinel이 보이면 다음 커서 페이지를 요청합니다. */
export function useCustomerQuoteLoadMoreSentinel(
  onLoadMore: () => void,
  enabled: boolean,
) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "160px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onLoadMore]);

  return sentinelRef;
}
