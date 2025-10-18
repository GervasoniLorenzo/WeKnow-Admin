import { useState } from "react";
import type { EventItem } from "../../lib/types";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { TextArea } from "../ui/Field";
import styles from "./EmailModal.module.css";

export default function EmailModal({
  event,
  onClose,
  onSend,
}: {
  event: EventItem;
  onClose: () => void;
  onSend: (eventId: number, html: string) => Promise<void>;
}) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const footer = (
    <div className={styles.actions}>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        variant="ghost"
        disabled={loading}
        onClick={async () => {
          try {
            setErr("");
            setLoading(true);
            await onSend(event.id, html);
            onClose();
          } catch (e: any) {
            setErr(e.message ?? "Errore invio email");
          } finally {
            setLoading(false);
          }
        }}
      >
        Send
      </Button>
    </div>
  );

  return (
    <Modal title={`Send Email: ${event.name}`} onClose={onClose} footer={footer} maxWidth={820}>
      {err && <div className={styles.error}>{err}</div>}
      <TextArea placeholder="<!DOCTYPE html>..." value={html} onChange={(e) => setHtml(e.target.value)} />
    </Modal>
  );
}
