"use client";

import { useEffect, useRef } from "react";

/**
 * 목록 하단 sentinel이 보이면 onLoadMore를 호출합니다.
 * favorite feature 전용이며 mover-search hook을 직접 import하지 않습니다.
 */
export function useLoadMoreSentinel(onLoadMore: () => void, enabled: boolean) {
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
