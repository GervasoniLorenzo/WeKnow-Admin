export const ENDPOINTS = {
  events: "/event/list",
  event: (id: number) => `/event/${id}`,
  email: (id: number) => `/event/mail/${id}`,
  artists: "/artist/list",
  admin: {
    //EVENTS
    events: "/admin/event/list",
    createEvent: "/admin/event",
    updateEvent: (id: number) => `/admin/event/${id}`,
    deleteEvent: (id: number) => `/admin/event/${id}`,
    uploadEventImage: "/admin/event/image",
    //ARTISTS
    artists: "/admin/artist/list",
    createArtist: "/admin/artist",
    updateArtist: (id: number) => `/admin/artist/${id}`,
    deleteArtist: (id: number) => `/admin/artist/${id}`,
    //RELEASES
    releases: "/admin/release/list",
    createRelease: "/admin/release",
    updateRelease: (id: number) => `/admin/release/${id}`,
    deleteRelease: (id: number) => `/admin/release/${id}`,
    uploadReleaseImage: "/admin/release/image",

  },
};
