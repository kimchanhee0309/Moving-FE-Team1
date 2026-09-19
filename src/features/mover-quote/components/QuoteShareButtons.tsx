"use client";

/**
 * 현재 견적 상세 URL을 복사하거나 외부 SNS 공유 창을 엽니다.
 *
 * window와 Clipboard API를 사용하므로 Client Component입니다.
 * 공유 API 실패 여부는 사용자에게 aria-live 메시지로 알립니다.
 */

import { useState } from "react";

import { IconButton } from "@/common/components/button";

export function QuoteShareButtons() {
  const [copyMessage, setCopyMessage] = useState("");

  /** 공유 시 query string을 포함한 현재 상세 페이지 URL을 사용합니다. */
  const getShareUrl = () => window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopyMessage("견적 링크가 복사되었습니다.");
    } catch {
      setCopyMessage("링크를 복사하지 못했습니다.");
    }
  };

  const handleShareKakaoStory = () => {
    const encodedUrl = encodeURIComponent(getShareUrl());

    window.open(
      `https://story.kakao.com/s/share?url=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShareFacebook = () => {
    const encodedUrl = encodeURIComponent(getShareUrl());

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <>
      {/* 태블릿·데스크톱에서는 Figma의 md 아이콘 버튼을 사용합니다. */}
      <div className="mt-5 hidden items-center gap-3 min-[744px]:flex">
        <IconButton
          kind="clip"
          size="md"
          aria-label="견적 링크 복사"
          onClick={() => void handleCopyLink()}
        />

        <IconButton
          kind="kakao"
          size="md"
          aria-label="카카오스토리로 공유"
          onClick={handleShareKakaoStory}
        />

        <IconButton
          kind="facebook"
          size="md"
          aria-label="페이스북으로 공유"
          onClick={handleShareFacebook}
        />
      </div>

      {/* 모바일에서는 동일한 기능을 더 작은 xs 버튼으로 제공합니다. */}
      <div className="mt-5 flex items-center gap-3 min-[744px]:hidden">
        <IconButton
          kind="clip"
          size="xs"
          aria-label="견적 링크 복사"
          onClick={() => void handleCopyLink()}
        />

        <IconButton
          kind="kakao"
          size="xs"
          aria-label="카카오스토리로 공유"
          onClick={handleShareKakaoStory}
        />

        <IconButton
          kind="facebook"
          size="xs"
          aria-label="페이스북으로 공유"
          onClick={handleShareFacebook}
        />
      </div>

      <p
        className="mt-2 min-h-6 text-[13px] leading-[22px] text-[var(--content-muted)]"
        role="status"
        aria-live="polite"
      >
        {copyMessage}
      </p>
    </>
  );
}
