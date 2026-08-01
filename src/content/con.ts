import type { StaticImageData } from "next/image";

import adAstra from "./logo/ad-astra.png";
import polcon from "./logo/polcon.png";
import keyArt from "./key-art.png";
import fahrenheit from "./partners/fahrenheit.png";
import konwentyPoludniowe from "./partners/konwenty-poludniowe.png";
import miastoZielonaGora from "./partners/miasto-zielona-gora.png";
import planetariumWenus from "./partners/planetarium-wenus.png";
import uniwersytetZielonogorski from "./partners/uniwersytet-zielonogorski.jpg";
import zok from "./partners/zok.jpg";

export const KEY_ART = keyArt;

/**
 * Both marks were lifted from the key art, so they carry its lilac and only
 * work on a dark ground.
 */
export const marks = [
  {
    name: "Zielonogórski Klub Fantastyki Ad Astra",
    src: adAstra,
    href: "/organizator/",
  },
  {
    name: "Polcon, Ogólnopolski Konwent Miłośników Fantastyki",
    src: polcon,
    href: "https://polcon.pl/",
  },
];

export const con = {
  edition: "XL",
  rank: "Polcon",
  name: "Bachanalia Fantastyczne",
  dates: "25-27 września 2026",
  datesShort: "25-27 IX 2026",
  venue: "Kampus B Uniwersytetu Zielonogórskiego",
  address: "Wojska Polskiego 69, Zielona Góra",
  organiser: "Zielonogórski Klub Fantastyki Ad Astra",
  hours: [
    { day: "Piątek", from: "14:00" },
    { day: "Sobota", from: "9:30" },
    { day: "Niedziela", from: "9:30" },
  ],
  /** From czas-i-miejsce: the UZ building has to be vacated at 20:00. */
  buildingCloses: "20:00",
};

export const blocks = [
  {
    href: "/blok-prelekcyjny/",
    label: "Blok prelekcyjny",
    note: "Motywem przewodnim jest science fiction",
  },
  {
    href: "/blok-konkursowy/",
    label: "Blok konkursowy",
    note: "Bachele do wydania w konwentowym sklepiku",
  },
  { href: "/blok-naukowy/", label: "Blok naukowy", note: "Wykłady i panele" },
  { href: "/blok-komiksowy/", label: "Blok komiksowy", note: "Komiks polski i zagraniczny" },
  { href: "/rpg/", label: "RPG", note: "Sesje prowadzi Skrzywienie Fabularne" },
  { href: "/gamesroom/", label: "Gamesroom", note: "Blisko 500 gier planszowych" },
  { href: "/retro-gaming/", label: "Retro gaming", note: "Lan-party i wolne granie" },
  { href: "/cosplay/", label: "Cosplay" },
];

/**
 * Order, wording and slug are ours; the price comes from WooCommerce. Golden
 * Ticket leads so the column reads downward in price, and because what it
 * adds over the three-day pass is the reason anyone would choose it.
 */
export const accreditation = [
  {
    slug: "golden-ticket",
    label: "Golden Ticket",
    note: "Akredytacja 3-dniowa: Fantazje Zielonogórskie, pins, koszulka, notes i gadżety",
  },
  { slug: "akredytacja-3-dniowa", label: "Trzydniowa", note: "Piątek, sobota i niedziela" },
  { slug: "akredytacja-sobota", label: "Sobota" },
  { slug: "akredytacja-piatek", label: "Piątek" },
  { slug: "akredytacja-niedziela", label: "Niedziela" },
];

export type PartnerLogo = {
  name: string;
  src: StaticImageData;
  /**
   * The artwork ships baked onto an opaque white rectangle, so it needs
   * multiplying into the page instead of sitting in a visible box.
   */
  whiteBox?: boolean;
};

export const partners: { tier: string; logos: PartnerLogo[] }[] = [
  {
    tier: "Współorganizatorzy",
    logos: [
      {
        name: "Uniwersytet Zielonogórski",
        src: uniwersytetZielonogorski,
        whiteBox: true,
      },
    ],
  },
  {
    tier: "Partnerzy",
    logos: [
      {
        name: "Planetarium Wenus",
        src: planetariumWenus,
      },
      {
        name: "Zielonogórski Ośrodek Kultury",
        src: zok,
        whiteBox: true,
      },
    ],
  },
  {
    tier: "Patroni medialni",
    logos: [
      {
        name: "Fahrenheit",
        src: fahrenheit,
      },
      {
        name: "Konwenty Południowe",
        src: konwentyPoludniowe,
      },
    ],
  },
];

export const cityFunding = {
  name: "Zrealizowano przy pomocy finansowej Miasta Zielona Góra",
  src: miastoZielonaGora,
};

export type NewsItem = { title: string; href: string; date: string };
