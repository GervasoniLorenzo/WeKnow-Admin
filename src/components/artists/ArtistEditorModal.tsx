import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, TextInput } from "../ui/Field";
import type { ArtistDto, UpdateArtistDto } from "../../lib/types";
import styles from "./ArtistEditorModal.module.css";

interface Props {
  show: boolean;
  mode: "create" | "edit";
  initial?: { id?: number; name?: string };
  onClose: () => void;
  onSave: (payload: ArtistDto | UpdateArtistDto, id?: number) => Promise<void>;
}

export default function ArtistEditorModal({ show, mode, initial, onClose, onSave }: Props) {
  if (!show) return null;

  const [name, setName] = useState(initial?.name ?? "");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit") { setName(initial?.name ?? ""); setErr(""); }
  }, [initial, mode]);

  useEffect(() => {
    if (mode === "create") { setName(""); setErr(""); }
  }, [show, mode]);

  const handleSave = async () => {
    if (!name.trim()) return setErr("Il nome è obbligatorio");
    try {
      setErr(""); setLoading(true);
      const base: ArtistDto = { name: name.trim() };
      if (mode === "edit" && initial?.id != null) {
        await onSave({ id: initial.id, ...base }, initial.id);
      } else {
        await onSave(base);
      }
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Errore salvataggio artista");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={mode === "edit" ? "Modifica artista" : "Crea artista"} onClose={onClose} maxWidth={520}>
      <div className={styles.form}>
        {err && <div className={styles.error}>{err}</div>}
        <Field label="Nome artista" inputId="artistName">
          <TextInput
            id="artistName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. East End Dubs"
            autoFocus
            required
          />
        </Field>
        <div className={styles.footer}>
          <Button onClick={handleSave}>
            {mode === "edit" ? "Salva modifiche" : "Crea artista"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
