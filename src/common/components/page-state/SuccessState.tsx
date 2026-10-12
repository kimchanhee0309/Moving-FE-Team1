import type { ReactNode } from "react";

import styles from "./PageState.module.css";

interface SuccessStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SuccessState({
  title,
  description,
  action,
}: SuccessStateProps) {
  return (
    <section className={styles.container} role="status" aria-live="polite">
      <h2 className={`${styles.title} text-xl-semibold`}>{title}</h2>

      {description && (
        <p className={`${styles.description} text-md-regular`}>{description}</p>
      )}

      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}
