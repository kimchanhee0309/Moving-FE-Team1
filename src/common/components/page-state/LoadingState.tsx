import styles from "./PageState.module.css";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "불러오는 중이에요.",
}: LoadingStateProps) {
  return (
    <section
      className={styles.container}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className={styles.spinner} aria-hidden="true" />

      <p className={`${styles.description} text-md-regular`}>{message}</p>
    </section>
  );
}
