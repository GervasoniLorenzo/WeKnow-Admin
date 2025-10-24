import React from "react";
import type { ReleaseItem } from "../../lib/types";
import Button from "../ui/Button";
import styles from "./ReleasesTable.module.css";
import { API_BASE_URL } from "../../config/api";

interface ReleasesTableProps {
  items: ReleaseItem[];
  onEdit: (r: ReleaseItem) => void;
  onDelete: (r: ReleaseItem) => void;
}

export default function ReleasesTable({ items, onEdit, onDelete }: ReleasesTableProps) {
  if (items.length === 0) {
    return (
      <div className={styles.centerWrap}>
        <div className={styles.table}>
          <div className={styles.empty}>Nessuna release</div>
        </div>
      </div>
    );
  }

  const getThumb = (r: ReleaseItem) => {
    if (r.slug) return `${API_BASE_URL}/release/image/${r.slug}`;
    return undefined;
  };

  return (
    <div className={styles.centerWrap}>
      <div className={styles.table}>
        <div className={styles.header}>
          <div>Titolo</div>
          <div>Data</div>
          <div className={styles.artistsCol}>Artisti</div>
          <div>Label</div>
          <div style={{ textAlign: "right" }}>Azioni</div>
        </div>

        {items.map((r) => {
          const thumb = getThumb(r);
          return (
            <div key={r.id} className={styles.row}>
              <div className={styles.titleCell}>
                {thumb && <img className={styles.thumb} src={thumb} alt={r.title} />}
                <div className={styles.title}>{r.title}</div>
              </div>
              <div>{r.releaseDate ? new Date(r.releaseDate).toLocaleDateString() : "-"}</div>
              <div className={styles.artistsCell}>
                <div className={styles.artistsText}>
                  {r.artists?.map((a) => a.name).join(", ") || "-"}
                </div>
              </div>
              <div>{r.label || "-"}</div>
              <div className={styles.actions}>
                <Button className={styles.btnSm} onClick={() => onEdit(r)}>Modifica</Button>
                <Button className={`${styles.btnSm} ${styles.btnDanger}`} onClick={() => onDelete(r)}>
                  Elimina
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
