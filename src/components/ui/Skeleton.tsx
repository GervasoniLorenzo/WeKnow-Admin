import styles from "./Skeleton.module.css";

export default function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className={styles.wrap}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={styles.line} />
      ))}
    </div>
  );
}
