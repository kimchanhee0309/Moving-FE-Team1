"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("MoverDetail");

  return (
    <aside className="flex w-full shrink-0 flex-col gap-10 min-[1200px]:w-[320px]">
      <div className="flex flex-col gap-4">
        <p className="text-2lg-semibold text-[var(--content-strong)]">
          {t("designatedPromptFirst", { name: moverName })}
          <br />
          {t("designatedPromptSecond", { name: moverName })}
        </p>

        <Button
          size="md"
          fullWidth
          disabled={isDesignatedComplete}
          onClick={onDesignatedClick}
          className={isDesignatedComplete ? DESIGNATED_COMPLETE_CLASS : ""}
        >
          {isDesignatedComplete ? t("designatedDone") : t("designatedRequest")}
        </Button>

        <button
          type="button"
          onClick={onFavoriteClick}
          disabled={!canToggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? t("unfavorite") : t("favorite")}
          className="text-2lg-semibold flex h-[54px] w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-[var(--line-200)] bg-[var(--gray-50)] text-[var(--black-500)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Image
            src="/icons/button/like-sm.svg"
            alt=""
            width={24}
            height={24}
            className="size-6"
          />
          {t("favorite")}
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
  const t = useTranslations("MoverDetail");
  const quote = useTranslations("Quote");

  return (
    <section
      aria-labelledby="mover-share-heading-compact"
      className="flex w-full flex-col gap-3"
    >
      <h2
        id="mover-share-heading-compact"
        className="text-lg-semibold text-[var(--content-strong)]"
      >
        {t("shareTitle")}
      </h2>
      <div className="flex gap-3">
        <IconButton
          kind="clip"
          size="xs"
          aria-label={t("copyLink")}
          onClick={onCopyLink}
        />
        <IconButton
          kind="kakao"
          size="xs"
          aria-label={t("share")}
          onClick={onShareKakao}
        />
        <IconButton
          kind="facebook"
          size="xs"
          aria-label={quote("shareFacebook")}
          onClick={onShareFacebook}
        />
      </div>
    </section>
  );
}

export function MoverSearchDetailStickyBar({
  isDesignatedComplete,
  canToggleFavorite,
  isFavorite,
  onDesignatedClick,
  onFavoriteClick,
}: MoverSearchDetailStickyBarProps) {
  const t = useTranslations("MoverDetail");

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-[var(--gray-50)] px-6 py-7 min-[744px]:px-[72px] min-[1200px]:hidden">
      <div className="flex w-full items-start gap-2">
        <IconButton
          kind="like"
          size="sm"
          aria-label={isFavorite ? t("unfavorite") : t("favorite")}
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
            {isDesignatedComplete
              ? t("designatedDone")
              : t("designatedRequest")}
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
  const t = useTranslations("MoverDetail");
  const quote = useTranslations("Quote");

  return (
    <section
      aria-labelledby="mover-share-heading"
      className="flex flex-col gap-[22px]"
    >
      <h2
        id="mover-share-heading"
        className="text-xl-semibold text-[var(--content-strong)]"
      >
        {t("shareTitle")}
      </h2>
      <div className="flex gap-4">
        <IconButton
          kind="clip"
          size="md"
          aria-label={t("copyLink")}
          onClick={onCopyLink}
        />
        <IconButton
          kind="kakao"
          size="md"
          aria-label={t("share")}
          onClick={onShareKakao}
        />
        <IconButton
          kind="facebook"
          size="md"
          aria-label={quote("shareFacebook")}
          onClick={onShareFacebook}
        />
      </div>
    </section>
  );
}
