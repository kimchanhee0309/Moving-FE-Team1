"use client";

import Image from "next/image";

import { Button } from "@/common/components/button/Button";
import { IconButton } from "@/common/components/button/IconButton";

interface MoverSearchDetailSidebarProps {
  moverName: string;
  isDesignatedComplete: boolean;
  canToggleFavorite: boolean;
  isFavorite: boolean;
  onDesignatedClick: () => void;
  onFavoriteClick: () => void;
  onCopyLink: () => void;
  onShareKakao: () => void;
  onShareFacebook: () => void;
}

interface MoverSearchDetailShareProps {
  onCopyLink: () => void;
  onShareKakao: () => void;
  onShareFacebook: () => void;
}

interface MoverSearchDetailStickyBarProps {
  isDesignatedComplete: boolean;
  canToggleFavorite: boolean;
  isFavorite: boolean;
  onDesignatedClick: () => void;
  onFavoriteClick: () => void;
}

const DESIGNATED_COMPLETE_CLASS =
  "!border-transparent !bg-[var(--gray-300)] !text-[var(--gray-50)] disabled:!bg-[var(--gray-300)]";

export function MoverSearchDetailSidebar({
  moverName,
  isDesignatedComplete,
  canToggleFavorite,
  isFavorite,
  onDesignatedClick,
  onFavoriteClick,
  onCopyLink,
  onShareKakao,
  onShareFacebook,
}: MoverSearchDetailSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-10 min-[1200px]:w-[320px]">
      <div className="flex flex-col gap-4">
        <p className="text-2lg-semibold text-[var(--content-strong)]">
          {moverName} 기사님에게
          <br />
          지정 견적을 요청해보세요!
        </p>

        <Button
          size="md"
          fullWidth
          disabled={isDesignatedComplete}
          onClick={onDesignatedClick}
          className={isDesignatedComplete ? DESIGNATED_COMPLETE_CLASS : ""}
        >
          {isDesignatedComplete ? "지정 견적 요청 완료" : "지정 견적 요청하기"}
        </Button>

        <button
          type="button"
          onClick={onFavoriteClick}
          disabled={!canToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "기사님 찜 해제" : "기사님 찜하기"}
          className="text-2lg-semibold flex h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl border border-[var(--line-200)] bg-[var(--gray-50)] text-[var(--black-500)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image
            src="/icons/button/like-sm.svg"
            alt=""
            width={24}
            height={24}
            className="size-6"
          />
          기사님 찜하기
        </button>
      </div>

      <MoverSearchDetailShare
        onCopyLink={onCopyLink}
        onShareKakao={onShareKakao}
        onShareFacebook={onShareFacebook}
      />
    </aside>
  );
}

export function MoverSearchDetailCompactShare({
  onCopyLink,
  onShareKakao,
  onShareFacebook,
}: MoverSearchDetailShareProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <p className="text-lg-semibold text-[var(--content-strong)]">
        나만 알기엔 아쉬운 기사님인가요?
      </p>
      <div className="flex gap-3">
        <IconButton
          kind="clip"
          size="xs"
          aria-label="기사님 링크 복사"
          onClick={onCopyLink}
        />
        <IconButton
          kind="kakao"
          size="xs"
          aria-label="카카오로 공유"
          onClick={onShareKakao}
        />
        <IconButton
          kind="facebook"
          size="xs"
          aria-label="페이스북으로 공유"
          onClick={onShareFacebook}
        />
      </div>
    </div>
  );
}

export function MoverSearchDetailStickyBar({
  isDesignatedComplete,
  canToggleFavorite,
  isFavorite,
  onDesignatedClick,
  onFavoriteClick,
}: MoverSearchDetailStickyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-[var(--gray-50)] px-6 py-7 min-[744px]:px-[72px] min-[1200px]:hidden">
      <div className="flex w-full items-start gap-2">
        <IconButton
          kind="like"
          size="sm"
          aria-label={isFavorite ? "기사님 찜 해제" : "기사님 찜하기"}
          aria-pressed={isFavorite}
          disabled={!canToggleFavorite}
          onClick={onFavoriteClick}
        />
        <div className="min-w-0 flex-1">
          <Button
            size="sm"
            fullWidth
            disabled={isDesignatedComplete}
            onClick={onDesignatedClick}
            className={isDesignatedComplete ? DESIGNATED_COMPLETE_CLASS : ""}
          >
            {isDesignatedComplete ? "지정 견적 요청 완료" : "지정 견적 요청하기"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MoverSearchDetailShare({
  onCopyLink,
  onShareKakao,
  onShareFacebook,
}: MoverSearchDetailShareProps) {
  return (
    <div className="flex flex-col gap-[22px]">
      <p className="text-xl-semibold text-[var(--content-strong)]">
        나만 알기엔 아쉬운 기사님인가요?
      </p>
      <div className="flex gap-4">
        <IconButton
          kind="clip"
          size="md"
          aria-label="기사님 링크 복사"
          onClick={onCopyLink}
        />
        <IconButton
          kind="kakao"
          size="md"
          aria-label="카카오로 공유"
          onClick={onShareKakao}
        />
        <IconButton
          kind="facebook"
          size="md"
          aria-label="페이스북으로 공유"
          onClick={onShareFacebook}
        />
      </div>
    </div>
  );
}
