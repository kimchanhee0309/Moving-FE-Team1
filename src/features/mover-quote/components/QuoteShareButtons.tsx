"use client";

import { useState } from "react";

import { IconButton } from "@/common/components/button";

export function QuoteShareButtons() {
  const [copyMessage, setCopyMessage] = useState("");

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
