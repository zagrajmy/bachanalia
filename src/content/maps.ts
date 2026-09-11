import type { StaticImageData } from "next/image";

import a16Parter from "./maps/a-16-parter.webp";
import a20ParterLewa from "./maps/a-20-parter-lewa.webp";
import a20ParterPrawa from "./maps/a-20-parter-prawa.webp";
import a20Pietro1 from "./maps/a-20-pietro-1.webp";
import bibliotekaParter from "./maps/biblioteka-uz-parter.webp";
import kampusB from "./maps/kampus-b-plan-terenu.webp";

/**
 * The plans Ludamus publishes for the con, copied here so the page that tells
 * people where to go carries them itself. Ludamus renders them next to a list
 * of rooms wired to its schedule; that list is what its own maps page is for.
 */
export const MAPS: { name: string; src: StaticImageData }[] = [
  { name: "Kampus B – plan terenu", src: kampusB },
  { name: "Budynek A-20 – parter, strona lewa", src: a20ParterLewa },
  { name: "Budynek A-20 – parter, strona prawa", src: a20ParterPrawa },
  { name: "Budynek A-20 – 1. piętro", src: a20Pietro1 },
  { name: "Budynek A-16 – parter", src: a16Parter },
  { name: "Biblioteka UZ – parter", src: bibliotekaParter },
];
