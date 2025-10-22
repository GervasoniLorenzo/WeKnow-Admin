export const ENDPOINTS = {
  events: "/event/list",
  event: (id: number) => `/event/${id}`,
  email: (id: number) => `/event/mail/${id}`,
  artists: "/artist/list",
  admin: {
    uploadEventImage: "/admin/event/image",
    artists: "/admin/artist/list",
    events: "/admin/event/list",
    createEvent: "/admin/event",
    updateEvent: (id: number) => `/admin/event/${id}`,
    deleteEvent: (id: number) => `/admin/event/${id}`,
  },
};
