import React from "react";
import styles from "./Banner.module.css";
import Button from "./Button";

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className={styles.error}>
      <div className={styles.title}>Errore</div>
      <div className={styles.msg}>{message}</div>
      {onRetry && <Button variant="white" onClick={onRetry}>Riprova</Button>}
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className={styles.empty}>
      <div className={styles.title}>{title}</div>
      {hint && <div className={styles.msg}>{hint}</div>}
      {action}
    </div>
  );
}
