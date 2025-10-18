import { Link } from "react-router-dom";
import styles from "./AdminTopBar.module.css";

export default function AdminTopBar({}: {}) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <h1 className={styles.title}>WeKnow</h1>
        <span className={styles.badge}>ADMIN</span>
      </div>
      <nav className={styles.nav}>
        <Link to="/events" className={styles.link}>Eventi</Link>
        {/* aggiungi altri link se ti servono */}
      </nav>
    </header>
  );
}
