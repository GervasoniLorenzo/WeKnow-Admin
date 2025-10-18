export type Artist = { id: number; name: string; slug: string };

export type EventItem = {
  id: number;
  name: string;
  date: string;
  location: string;
  artists: Artist[];
};

export type EventDto = {
  name: string;
  location: string;
  date: string | null;
  artistsIds: number[];
};

export type UpdateEventDto = EventDto & {
  id: number;
};