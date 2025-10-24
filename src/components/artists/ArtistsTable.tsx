import React from "react";
import Button from "../ui/Button";
import type { Artist } from "../../lib/types";
import styles from "./ArtistsTable.module.css";

export default function ArtistsTable({
  items,
  onEdit,
  onDelete,
}: {
  items: Artist[];
  onEdit: (a: Artist) => void;
  onDelete: (a: Artist) => void;
}) {
  if (!items || items.length === 0) {
    return (
      <div className={styles.table}>
        <div className={styles.empty}>
          Nessun artista trovato. Clicca “+ Add Artist” per iniziare.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.centerWrap}>
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <div className={styles.cellName}>Nome</div>
          <div className={styles.cellActions}>Azioni</div>
        </div>

        {items.map((a) => (
          <div key={a.id} className={styles.row}>
            <div className={`${styles.cell} ${styles.cellName}`} title={a.name}>
              {a.name}
            </div>
            <div className={`${styles.cell} ${styles.cellActions}`}>
              <Button
                variant="icon"
                aria-label={`Modifica ${a.name}`}
                title="Modifica"
                className={styles.iconBtn}
                onClick={() => onEdit(a)}
              >
                {/* matita minimal */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M14.06 6.19l1.77-1.77a1.5 1.5 0 0 1 2.12 0l1.63 1.63a1.5 1.5 0 0 1 0 2.12L18.06 8.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </Button>
              <Button
                variant="icon"
                aria-label={`Elimina ${a.name}`}
                title="Elimina"
                className={styles.iconBtnDanger}
                onClick={() => onDelete(a)}
              >
                {/* cestino minimal */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 7h16" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
