"use client";

import { useLocale, useTranslations } from "next-intl";

interface OriginalTextNoticeProps {
  className?: string;
}

/**
 * 기사님이 직접 작성한 소개글처럼 번역되지 않는 사용자 콘텐츠 옆에 "원문" 안내를 표시합니다.
 * 원문 언어(ko) 화면에서는 렌더하지 않습니다. 콘텐츠 자체는 호출부가 lang="ko"로 표시합니다.
 */
export function OriginalTextNotice({ className }: OriginalTextNoticeProps) {
  const locale = useLocale();
  const t = useTranslations("UserContent");

  if (locale === "ko") return null;

  return (
    <p className={["text-xs-regular text-(--gray-400)", className].filter(Boolean).join(" ")}>
      {t("originalNotice")}
    </p>
  );
}
