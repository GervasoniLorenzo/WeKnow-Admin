import React from "react";
import styles from "./Field.module.css";

type FieldProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  inputId?: string; // id del controllo principale (input/select/textarea)
};

export function Field({ label, children, inputId }: FieldProps) {
  return (
    <div className={styles.field}>
      <label
        className={styles.label}
        {...(inputId ? { htmlFor: inputId } : {})}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const { className, ...rest } = props;
  return <input {...rest} className={[styles.input, className].filter(Boolean).join(" ")} />;
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>
) {
  const { className, ...rest } = props;
  return <select {...rest} className={[styles.input, className].filter(Boolean).join(" ")} />;
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const { className, ...rest } = props;
  return <textarea {...rest} className={[styles.textarea, className].filter(Boolean).join(" ")} />;
}
