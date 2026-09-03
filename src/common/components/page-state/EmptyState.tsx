import type { ReactNode } from "react";

import styles from "./PageState.module.css";

interface EmptyStateProps {
  title: string;
  description?: string;
  image?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  image,
  action,
}: EmptyStateProps) {
  return (
    <section className={styles.container}>
      {image && <div className={styles.image}>{image}</div>}

      <h2 className={`${styles.title} text-xl-semibold`}>{title}</h2>

      {description && (
        <p className={`${styles.description} text-md-regular`}>{description}</p>
      )}

      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}
