"use client";

import styles from "./PageState.module.css";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "문제가 발생했어요.",
  description = "잠시 후 다시 시도해 주세요.",
  onRetry,
}: ErrorStateProps) {
  return (
    <section className={styles.container} role="alert">
      <h2 className={`${styles.title} text-xl-semibold`}>{title}</h2>

      <p className={`${styles.description} text-md-regular`}>{description}</p>

      {onRetry && (
        <button
          type="button"
          className={`${styles.button} text-lg-semibold`}
          onClick={onRetry}
        >
          다시 시도
        </button>
      )}
    </section>
  );
}
