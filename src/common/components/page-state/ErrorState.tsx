"use client";

import { useTranslations } from "next-intl";

import styles from "./PageState.module.css";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({ title, description, onRetry, retryLabel }: ErrorStateProps) {
  const t = useTranslations("Common");

  return (
    <section className={styles.container} role="alert">
      <h2 className={`${styles.title} text-xl-semibold`}>{title ?? t("errorTitle")}</h2>

      <p className={`${styles.description} text-md-regular`}>{description ?? t("errorDescription")}</p>

      {onRetry && (
        <button
          type="button"
          className={`${styles.button} text-lg-semibold`}
          onClick={onRetry}
        >
          {retryLabel ?? t("retry")}
        </button>
      )}
    </section>
  );
}
