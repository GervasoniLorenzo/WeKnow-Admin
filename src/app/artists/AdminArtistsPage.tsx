import { useEffect, useState } from "react";
import AdminTopBar from "../../components/layout/AdminTopBar";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { ErrorBanner, EmptyState } from "../../components/ui/Banner";
import { apiGET, apiPOST, apiPUT, apiDELETE } from "../../lib/api";
import { ENDPOINTS } from "../../lib/endpoints";
import type { ArtistDto, UpdateArtistDto } from "../../lib/types";
import ArtistsTable from "../../components/artists/ArtistsTable";
import ArtistEditorModal from "../../components/artists/ArtistEditorModal";

type Artist = { id: number; name: string; slug: string };

export default function AdminArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Artist | null>(null);

  const loadAll = async () => {
    setLoading(true); setErr("");
    try {
      const list = await apiGET<Artist[]>(ENDPOINTS.admin.artists);
      setArtists(list || []);
    } catch (e: any) {
      setErr(e?.message ?? "Errore caricamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleAdd = () => { setEditing(null); setShowModal(true); };
  const handleEdit = (a: Artist) => { setEditing(a); setShowModal(true); };

  const handleSave = async (payload: ArtistDto | UpdateArtistDto, id?: number) => {
    if (id) await apiPUT(ENDPOINTS.admin.updateArtist(id), payload);
    else await apiPOST(ENDPOINTS.admin.createArtist, payload);
    // refresh in background per chiudere subito la modale (stesso pattern eventi che hai chiesto)
    loadAll().catch(console.error);
  };

  const handleDelete = async (a: Artist) => {
    if (!confirm(`Eliminare l'artista "${a.name}"?`)) return;
    await apiDELETE(ENDPOINTS.admin.deleteArtist(a.id));
    loadAll().catch(console.error);
  };

  const handleCloseModal = () => { setShowModal(false); setEditing(null); };

  return (
    <div style={{ minHeight: "100vh" }}>
      <AdminTopBar />

      <div style={{ paddingTop: "calc(var(--navbar-h) + 24px)" }}>
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2>Artists</h2>
            <Button onClick={handleAdd} aria-label="Aggiungi artista">+ Add Artist</Button>
          </div>

          {loading && <Skeleton lines={6} />}
          {!loading && err && <ErrorBanner message={err} onRetry={loadAll} />}
          {!loading && !err && artists.length === 0 && (
            <EmptyState
              title="Ancora nessun artista"
              hint="Crea il tuo primo artista per iniziare a popolare la lista."
              action={<Button variant="white" onClick={handleAdd}>+ Add Artist</Button>}
            />
          )}
          {!loading && !err && artists.length > 0 && (
            <ArtistsTable items={artists} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </section>

        <ArtistEditorModal
          show={showModal}
          mode={editing ? "edit" : "create"}
          initial={editing || undefined}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
