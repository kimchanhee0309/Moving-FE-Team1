"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { SortDropdown } from "@/common/components/Dropdown";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// 언어 이름은 사용자가 자기 언어를 찾을 수 있도록 현재 locale과 무관하게 각 언어의 자국어 표기로 둡니다.
const LOCALE_LABELS: Record<(typeof routing.locales)[number], string> = {
  ko: "한국어",
  en: "English",
  zh: "中文",
};

const LOCALE_OPTIONS = routing.locales.map((locale) => ({ value: locale, label: LOCALE_LABELS[locale] }));

function isAppLocale(value: string): value is (typeof routing.locales)[number] {
  return routing.locales.some((locale) => locale === value);
}

/** 현재 경로와 쿼리·hash를 유지한 채 선택한 표시 언어로 이동합니다. */
export function LocaleSwitcher() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (nextLocale: string) => {
    if (!isAppLocale(nextLocale) || nextLocale === locale) return;
    router.replace(`${pathname}${window.location.search}${window.location.hash}`, { locale: nextLocale, scroll: false });
  };

  return (
    <SortDropdown
      options={LOCALE_OPTIONS}
      value={locale}
      onChange={handleChange}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      size="sm"
      ariaLabel={t("language")}
      className="[&>button]:min-h-9 [&_button]:text-[clamp(13px,1vw,16px)]! min-[1200px]:[&>button]:min-h-10"
    />
  );
}
