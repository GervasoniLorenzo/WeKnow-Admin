import React from "react";
import styles from "./Button.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "white" | "ghost" | "icon";
  as?: "button" | "a";
  href?: string;
  loading?: boolean;
};

export default function Button({
  variant = "ghost",
  className,
  as = "button",
  href,
  loading = false,
  disabled,
  children,
  ...rest
}: Props) {
  const cls = [
    styles.btn,
    styles[variant],
    loading ? styles.isLoading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </>
  );

  if (as === "a" && href) {
    // anchors can’t be truly disabled; expose state via aria
    return (
      <a
        href={href}
        className={cls}
        aria-disabled={loading || undefined}
        aria-busy={loading || undefined}
        {...(rest as any)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}