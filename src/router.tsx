import { createBrowserRouter, Navigate } from "react-router-dom";
// ...
import AdminEventsPage from "./app/events/AdminEventsPage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/events" replace  /> },                  // opzionale
  { path: "/events", element: <AdminEventsPage /> }, // <-- rotta piatta
]);

export default router;
