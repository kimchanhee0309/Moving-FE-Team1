import { useTranslations } from "next-intl";

import styles from "./PageState.module.css";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const t = useTranslations("Common");
  return (
    <section
      className={styles.container}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.spinner} aria-hidden="true" />

      <p className={`${styles.description} text-md-regular`}>{message ?? t("loading")}</p>
    </section>
  );
}
