import { createBrowserRouter, Navigate } from "react-router-dom";
// ...
import AdminEventsPage from "./app/events/AdminEventsPage";
import AdminArtistsPage from "./app/artists/AdminArtistsPage";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/events" replace  /> },      
  { path: "/events", element: <AdminEventsPage /> }, 
  { path: "/artists", element: <AdminArtistsPage />,}
]);

export default router;
