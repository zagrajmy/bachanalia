import type { StaticImageData } from "next/image";

import { guests as synced } from "./guests.generated";

export type Guest = {
  /** Paragraphs. Guests without a bio get no detail page. */
  bio?: string[];
  name: string;
  photo?: StaticImageData;
  /** CSS object-position for the 3:4 card crop, when centre cuts the face off. */
  photoFocus?: string;
  slug: string;
};

export const GUESTS_YEAR = 2026;

/** Only guests with a bio get a page of their own. */
export const hasBio = (guest: Guest): guest is Guest & { bio: string[] } => guest.bio !== undefined;

export const guestPath = (guest: Guest) => (hasBio(guest) ? `/goscie/${guest.slug}/` : undefined);

/** Hand-picked crops; the sheet knows nothing about faces. */
const photoFocus: Record<string, string> = {
  "agnieszka-fulinska": "left bottom",
  "grzegorz-pawlak": "35% center",
};

export const guests: Guest[] = synced.map((guest) => ({
  ...guest,
  photoFocus: photoFocus[guest.slug],
}));
