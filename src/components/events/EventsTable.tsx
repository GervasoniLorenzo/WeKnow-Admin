import React from "react";
import type { EventItem } from "../../lib/types";
import Button from "../ui/Button";
import styles from "./EventsTable.module.css";

interface EventsTableProps {
  events: EventItem[];
  onEdit: (ev: EventItem) => void;
  onSendMail: (ev: EventItem) => void;
}

export default function EventsTable({ events, onEdit, onSendMail }: EventsTableProps) {
  if (events.length === 0) {
    return (
      <div className={styles.table}>
        <div className={styles.empty}>
          Nessun evento trovato. Clicca "+ Add Event" per iniziare.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.centerWrap}>
      <div className={styles.table}>
        <div className={styles.header}>
          <div>Nome</div>
          <div>Data</div>
          <div>Luogo</div>
          <div>Artisti</div>
          <div style={{ textAlign: 'right' }}>Azioni</div>
        </div>

        {events.map((ev) => (
          <div key={ev.id} className={styles.row}>
            <div className={`${styles.cell} ${styles.name}`}>
              {ev.name}
            </div>

            <div className={`${styles.cell} ${styles.date}`}>
              {new Date(ev.date).toLocaleDateString("it-IT", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              })}
            </div>

            <div className={`${styles.cell} ${styles.location}`}>
              {ev.location || "—"}
            </div>

            <div className={`${styles.cell} ${styles.artists}`}>
              {ev.artists?.length > 0
                ? ev.artists.map(a => a.name).join(", ")
                : "—"
              }
            </div>

            <div className={styles.actions}>
              <Button
                variant="icon"
                title="Invia email"
                onClick={() => onSendMail(ev)}
              >
                ✉️
              </Button>
              <Button
                variant="icon"
                title="Modifica"
                onClick={() => onEdit(ev)}
              >
                ✏️
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}