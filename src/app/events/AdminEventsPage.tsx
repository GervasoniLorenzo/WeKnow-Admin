import { useEffect, useState } from "react";
import type { EventItem } from "../../lib/types";
import { ENDPOINTS } from "../../lib/endpoints";
import { apiGET, apiPOST, apiPOSTNoContent, apiPUT } from "../../lib/api";
import AdminTopBar from "../../components/layout/AdminTopBar";
import EventsTable from "../../components/events/EventsTable";
import EventEditorModal from "../../components/events/EventEditorModal";
import EmailModal from "../../components/events/EmailModal";
import Skeleton from "../../components/ui/Skeleton";
import { ErrorBanner, EmptyState } from "../../components/ui/Banner";
import Button from "../../components/ui/Button";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [mailFor, setMailFor] = useState<EventItem | null>(null);

  const loadAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const ev = await apiGET<EventItem[]>(ENDPOINTS.admin.events);
      setEvents(ev);
    } catch (e: any) {
      setErr(e.message ?? "Errore caricamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = async (payload: Omit<EventItem, "id">, id?: number) => {
    console.log("Saving event", { payload });
    if (id) {
      await apiPUT<EventItem>(ENDPOINTS.admin.updateEvent(id), payload);
    } else {
      await apiPOST<EventItem>(ENDPOINTS.admin.createEvent, payload);
    }
    await loadAll();
  };

  const handleSendEmail = async (eventId: number, html: string) => {
    await apiPOSTNoContent(ENDPOINTS.email(eventId), { html });
  };

  return (
    <div className="page">
      <div className="container">
        <AdminTopBar />

        <section className="card" style={{ marginTop: 16, display: "grid", gap: 12, overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Lista eventi</h2>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#93a1b6" }}>
              {events.length} eventi
            </span>
            <Button
              variant="white"
              onClick={handleAddEvent}
              aria-label="Aggiungi evento"
            >
              + Add Event
            </Button>
          </div>

          {loading && <Skeleton lines={6} />}

          {!loading && err && <ErrorBanner message={err} onRetry={loadAll} />}

          {!loading && !err && events.length === 0 && (
            <EmptyState
              title="Ancora nessun evento"
              hint="Crea il tuo primo evento per iniziare a popolare la lista."
              action={<Button variant="white" onClick={handleAddEvent}>+ Add Event</Button>}
            />
          )}

          {!loading && !err && events.length > 0 && (
            <EventsTable
              events={events}
              onEdit={handleEditEvent}
              onSendMail={setMailFor}
            />
          )}
        </section>

        <EventEditorModal
          show={showModal}
          mode={editingEvent ? "edit" : "create"}
          initial={editingEvent || undefined}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
        />

        {mailFor && (
          <EmailModal
            event={mailFor}
            onClose={() => setMailFor(null)}
            onSend={handleSendEmail}
          />
        )}
      </div>
    </div>
  );
}