import React from "react";
import styles from "./Modal.module.css";

export default function Modal({
  title,
  onClose,
  children,
  footer,
  maxWidth = 640,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} style={{ maxWidth }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button onClick={onClose} className={styles.close}>✕</button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
