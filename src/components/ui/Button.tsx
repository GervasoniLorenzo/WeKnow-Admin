import React from "react";
import styles from "./Button.module.css";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "white" | "ghost" | "icon";
  as?: "button" | "a";
  href?: string;
};

export default function Button({ variant = "ghost", className, as="button", href, ...props }: Props) {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(" ");
  if (as === "a" && href) {
    return <a href={href} className={cls} {...(props as any)} />;
  }
  return <button className={cls} {...props} />;
}