"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/common/components/page-state";

interface ErrorPageProps {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations("Page");
  const common = useTranslations("Common");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title={t("errorTitle")}
      description={t("errorDescription")}
      onRetry={reset}
      retryLabel={common("retry")}
    />
  );
}
