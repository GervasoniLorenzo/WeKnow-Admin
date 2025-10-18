import { useState, useEffect } from "react";
import type { Artist, EventDto, EventItem, UpdateEventDto } from "../../lib/types";
import { apiGET } from "../../lib/api";
import { ENDPOINTS } from "../../lib/endpoints";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, TextInput } from "../ui/Field";
import styles from "./EventEditorModal.module.css";

interface EventEditorModalProps {
  show: boolean;
  mode: "create" | "edit";
  initial?: Partial<EventItem>;
  onClose: () => void;
  onSave: (payload: Omit<EventItem, "id">, id?: number) => Promise<void>;
}

// helper: format "YYYY-MM-DDTHH:mm" in ORARIO LOCALE per <input type="datetime-local">
function toLocalDateTimeInputValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function EventEditorModal({
  show,
  mode,
  initial,
  onClose,
  onSave,
}: EventEditorModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(
    initial?.date ? toLocalDateTimeInputValue(new Date(initial.date)) : ""
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [selectedArtists, setSelectedArtists] = useState<number[]>(
    initial?.artists?.map((a) => a.id) ?? []
  );

  const [id, setId] = useState(initial?.id ?? undefined);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (show) {
      setLoadingArtists(true);
      apiGET<Artist[]>(ENDPOINTS.admin.artists)
        .then(setArtists)
        .catch(console.error)
        .finally(() => setLoadingArtists(false));
    }
  }, [show]);

  useEffect(() => {
    if (initial) {
      setId(initial.id);
      setName(initial.name ?? "");
      setDate(initial.date ? toLocalDateTimeInputValue(new Date(initial.date)) : "");
      setLocation(initial.location ?? "");
      setSelectedArtists(initial.artists?.map((a) => a.id) ?? []);
    }
  }, [initial]);

  useEffect(() => {
    if (!show) return;
    if (mode === "create") {
      setId(undefined);
      setName("");
      setDate("");
      setLocation("");
      setSelectedArtists([]);
      setErr("");
    }
  }, [show, mode]);

  const addArtist = (id: number) => {
    if (!selectedArtists.includes(id)) {
      setSelectedArtists((prev) => [...prev, id]);
    }
  };

  const removeArtist = (id: number) => {
    setSelectedArtists((prev) => prev.filter((aid) => aid !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErr("Il nome è obbligatorio");
      return;
    }
    if (!date) {
      setErr("La data è obbligatoria");
      return;
    }

    try {
      setErr("");
      setLoading(true);
      const baseDto = {
        name: name.trim(),
        location: location.trim(),
        date: new Date(date).toISOString(), // RFC3339/UTC ok per backend *time.Time
        artistsIds: selectedArtists,        // <-- NOME CAMPO CORRETTO
      } satisfies EventDto;

      if (mode === "edit" && initial?.id != null) {
        const updateDto = {
          id: initial.id,
          ...baseDto,
        } satisfies UpdateEventDto;

        await onSave(updateDto as any, initial.id); // passiamo anche l'id per l'URL
      } else {
        await onSave(baseDto as any, undefined);
      }

      onClose();
    } catch (e: any) {
      setErr(e.message ?? "Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const footer = (
    <div className={styles.footer}>
      <Button variant="ghost" onClick={onClose} disabled={loading}>
        Annulla
      </Button>
      <Button onClick={handleSave} disabled={loading || loadingArtists}>
        {loading
          ? "Salvataggio..."
          : mode === "create"
            ? "Crea evento"
            : "Salva modifiche"}
      </Button>
    </div>
  );

  return (
    <Modal
      title={mode === "create" ? "Nuovo Evento" : "Modifica Evento"}
      onClose={onClose}
      footer={footer}
    >
      <div className={styles.form}>
        {err && <div className={styles.error}>{err}</div>}

        <Field label="Nome evento" inputId="nameInput">
          <TextInput
            id="nameInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Techno Night"
            autoFocus
            required
          />
        </Field>

        <Field label="Data e ora" inputId="dateInput">
          <TextInput
            id="dateInput"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Field>

        <Field label="Luogo" inputId="placeInput">
          <TextInput
            id="placeInput"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Es. Milano, Fabrique"
          />
        </Field>

        <Field label="Artisti" inputId="artistSelect">
          {loadingArtists ? (
            <div className={styles.loading}>Caricamento artisti...</div>
          ) : (
            <>
              <div className={styles.selectedArtists} tabIndex={-1}>
                {selectedArtists.map((artistId) => {
                  const artist = artists.find((a) => a.id === artistId);
                  if (!artist) return null;
                  return (
                    <div
                      key={artist.slug}
                      className={styles.artistTag}
                      id={`artist-tag-${artist.slug}`}
                    >
                      <span>{artist.name}</span>
                      <button
                        type="button"
                        id={`remove-${artist.slug}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeArtist(artistId);
                        }}
                        tabIndex={-1}
                        className={styles.removeBtn}
                        title="Rimuovi artista"
                        aria-label={`Rimuovi ${artist.name}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className={styles.addArtistRow}>
                <select
                  id="artistSelect"              // collega la label a questo controllo
                  className={styles.artistSelect}
                  value=""
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    if (id && !selectedArtists.includes(id)) {
                      addArtist(id);
                    }
                    e.target.value = "";
                  }}
                >
                  <option value="">+ Aggiungi artista</option>
                  {artists
                    .filter((a) => !selectedArtists.includes(a.id))
                    .map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.name}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}
          {artists.length === 0 && !loadingArtists && (
            <div className={styles.hint}>Nessun artista disponibile</div>
          )}
        </Field>
      </div>
    </Modal>
  );
}
