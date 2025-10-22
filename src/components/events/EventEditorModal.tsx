import { useState, useEffect, useMemo, useRef } from "react";
import type { Artist, EventDto, EventItem, UpdateEventDto } from "../../lib/types";
import { apiGET, apiUPLOAD } from "../../lib/api";
import { ENDPOINTS } from "../../lib/endpoints";
import { API_BASE_URL } from "../../config/api";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { Field, TextInput } from "../ui/Field";
import styles from "./EventEditorModal.module.css";

// Helper datetime-local
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function toLocalDateTimeInputValue(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EventEditorModalProps {
  show: boolean;
  mode: "create" | "edit";
  initial?: Partial<EventItem>;
  onClose: () => void;
  onSave: (payload: Omit<EventItem, "id">, id?: number) => Promise<void>;
}

export default function EventEditorModal({ show, mode, initial, onClose, onSave }: EventEditorModalProps) {
  if (!show) return null;
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(initial?.date ? toLocalDateTimeInputValue(new Date(initial.date)) : "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [selectedArtists, setSelectedArtists] = useState<number[]>(initial?.artists?.map((a) => a.id) ?? []);
  const [id, setId] = useState(initial?.id ?? undefined);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [err, setErr] = useState("");

  // --- immagine ---
  const [imageUuid, setImageUuid] = useState<string | null>(initial?.imageUuid ?? null);
  const [imageDirty, setImageDirty] = useState(false); // true solo se l’utente ha caricato una nuova immagine
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imgMissing, setImgMissing] = useState(false);

  const previewUrl = useMemo(() => {
    if (localPreview) return localPreview;                    // preview locale appena caricata
    if (initial?.slug) return `${API_BASE_URL}/event/image/${initial.slug}`; // preview immagine già salvata
    return null;
  }, [localPreview, initial?.slug]);

  useEffect(() => {
    if (show) {
      setLoadingArtists(true);
      apiGET<Artist[]>(ENDPOINTS.admin.artists)
        .then(setArtists)
        .finally(() => setLoadingArtists(false));
    }
  }, [show]);

  // Sync quando apro in edit
  useEffect(() => {
    if (!initial) return;
    if (mode === "edit") {
      setId(initial.id);
      setName(initial.name ?? "");
      setDate(initial.date ? toLocalDateTimeInputValue(new Date(initial.date)) : "");
      setLocation(initial.location ?? "");
      setSelectedArtists(initial.artists?.map((a) => a.id) ?? []);
      setImageUuid(initial.imageUuid ?? null);
      setLocalPreview(null);
      setImageDirty(false);
    }
  }, [initial, mode]);

  // Reset quando apro in create
  useEffect(() => {
    if (!show) return;
    if (mode === "create") {
      setId(undefined);
      setName(""); setDate(""); setLocation("");
      setSelectedArtists([]); setErr("");
      setImageUuid(null); setLocalPreview(null); setImageDirty(false);
    }
    setImgMissing(false);

  }, [previewUrl, show, mode]);

  useEffect(() => {
    setImgMissing(false);
  }, [previewUrl, show, mode]);

  const addArtist = (aid: number) => { if (!selectedArtists.includes(aid)) setSelectedArtists((p) => [...p, aid]); };
  const removeArtist = (aid: number) => setSelectedArtists((p) => p.filter((id) => id !== aid));

  // Upload immagine
  async function uploadFile(file: File) {
    const form = new FormData();
    form.append("file", file);
    // Se il BE richiede anche 'entity=event', scommenta:
    // form.append("entity", "event");

    const res = await apiUPLOAD<any>(ENDPOINTS.admin.uploadEventImage, form);
    const uuid: string | undefined = (res && (res.imageUuid || res.uuid || res.id || res.slug)) ?? undefined;
    if (!uuid) throw new Error("Upload risposta non valida");
    setImageUuid(uuid);
    setImageDirty(true);
  }

  function onFileChosen(f?: File | null) {
    if (!f) return;
    setImgMissing(false);
    setLocalPreview(URL.createObjectURL(f));
    uploadFile(f).catch((e) => {
      setErr(e?.message ?? "Upload immagine fallito");
      setLocalPreview(null);
      setImageUuid(initial?.imageUuid ?? null);
      setImageDirty(false);
    });
  }


  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    onFileChosen(e.dataTransfer?.files?.[0]);
  };
  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };

  const handleSave = async () => {
    if (!name.trim()) return setErr("Il nome è obbligatorio");
    if (!date) return setErr("La data è obbligatoria");

    try {
      setErr(""); setLoading(true);
      const baseDto: any = {
        name: name.trim(),
        location: location.trim(),
        date: new Date(date).toISOString(),
        artistsIds: selectedArtists,
      } as EventDto;

      // in create includo sempre se presente; in edit solo se cambiata
      if (mode === "create" ? imageUuid : imageDirty) {
        baseDto.imageUuid = imageUuid ?? null;
      }

      if (mode === "edit" && initial?.id != null) {
        const dto = { id: initial.id, ...baseDto } as UpdateEventDto;
        await onSave(dto as any, initial.id);
      } else {
        await onSave(baseDto as any, undefined);
      }
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={mode === "edit" ? "Modifica evento" : "Crea nuovo evento"} onClose={onClose} maxWidth={760}>
      <div className={styles.form}>
        {err && <div className={styles.error}>{err}</div>}

        {/* ROW IN CIMA: campi + box immagine a destra */}
        <div className={styles.topRow}>
          <div className={styles.leftCol}>
            <Field label="Nome evento" inputId="nameInput">
              <TextInput id="nameInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Techno Night" autoFocus required />
            </Field>

            <Field label="Data e ora" inputId="dateInput">
              <TextInput id="dateInput" type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            </Field>

            <Field label="Luogo" inputId="placeInput">
              <TextInput id="placeInput" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Es. Milano, Fabrique" />
            </Field>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.imageLabel}>Immagine evento</div>
            <div
              className={[styles.imageDrop, isDragging ? styles.dragOver : ""].join(" ")}
              onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button" aria-label="Carica immagine evento" tabIndex={0}
            >
              {previewUrl && !imgMissing ? (
                <img
                  src={previewUrl}
                  alt="Anteprima immagine evento"
                  className={styles.image}
                  onError={() => setImgMissing(true)}
                />
              ) : (
                <div className={styles.dropHint}>
                  <div className={styles.dropIcon}>📁</div>
                  <div>
                    Trascina qui o <span className={styles.dropAction}>clicca</span> per caricare
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
              />
              {/* pennina in edit (overlay) */}
              {mode === "edit" && <div className={styles.editOverlay} title="Sostituisci immagine">✏️</div>}

              <input
                ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className={styles.imageNote}>Formati supportati: JPG/PNG. L'immagine non verrà distorta o tagliata.</div>
          </div>
        </div>

        {/* ARTISTI */}
        <Field label="Artisti" inputId="artistSelect">
          {loadingArtists ? (
            <div>Caricamento...</div>
          ) : (
            <>
              <div className={styles.artistGrid}>
                {selectedArtists.length > 0 ? (
                  selectedArtists.map((aid) => {
                    const artist = artists.find((a) => a.id === aid);
                    return (
                      <div key={aid} className={styles.artistPill}>
                        <span className={styles.artistName}>{artist?.name ?? `ID ${aid}`}</span>
                        <button
                          className={styles.iconRemove}
                          aria-label={`Rimuovi ${artist?.name ?? "artista"}`}
                          title="Rimuovi"
                          onClick={() => removeArtist(aid)}
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className={styles.hint}>Nessun artista selezionato</div>
                )}
              </div>

              <div className={styles.addArtistRow}>
                <select
                  id="artistSelect"
                  className={styles.artistSelect}
                  value=""
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (val && !selectedArtists.includes(val)) setSelectedArtists((p) => [...p, val]);
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
        </Field>

        <div className={styles.footerRow}>
          <Button onClick={handleSave} loading={loading}>{mode === "edit" ? "Salva modifiche" : "Crea evento"}</Button>
        </div>
      </div>
    </Modal>
  );
}
