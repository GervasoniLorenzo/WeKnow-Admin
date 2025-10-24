export type EventItem = {
  id: number;
  name: string;
  date: string;
  location: string;
  artists: Artist[];
  slug?: string;
  imageUuid?: string | null;
};

export type EventDto = {
  name: string;
  location: string;
  date: string | null;
  artistsIds: number[];
  imageUuid?: string | null;
};

export type UpdateEventDto = EventDto & { id: number };

export type Artist = { id: number; name: string; slug: string };

export type ArtistDto = {
  name: string;
};

export type UpdateArtistDto = ArtistDto & { id: number };

export type ReleaseLink = {
  platform: string;
  url: string;
};

export type ReleaseItem = {
  id: number;
  slug: string;
  title: string;
  releaseDate: string; // ISO date
  label: string;
  artists: Artist[];
  imageId?: number | null;
  imageUrl?: string | null; // opzionale se il BE la fornisce
  links: ReleaseLink[];
};

export type ReleaseDto = {
  title: string;
  releaseDate: string | null; // ISO o null
  label: string;
  artistsIds: number[];
  imageId?: number | null;
  links: ReleaseLink[];
};

export type UpdateReleaseDto = ReleaseDto & { id: number };
