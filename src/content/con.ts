import type { StaticImageData } from "next/image";

import adAstra from "./logo/ad-astra.png";
import polcon from "./logo/polcon.png";
import keyArt from "./key-art.jpg";
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
  attendance: "500-850 uczestników",
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
  { href: "/cosplay/", label: "Cosplay", note: "Konkurs z regulaminem i jury" },
];

export const accreditation = [
  { label: "Trzydniowa", price: "100 zł" },
  { label: "Piątek", price: "50 zł" },
  { label: "Sobota", price: "60 zł" },
  { label: "Niedziela", price: "50 zł" },
  { label: "Golden Ticket", price: "250 zł" },
];

export type PartnerLogo = {
  name: string;
  src: StaticImageData;
  /**
   * Dark artwork on a transparent or white ground: it disappears on dark
   * surfaces and needs a light plate. False means the mark carries its own
   * background (Planetarium Wenus is a solid red tile), so plating it just
   * frames the tile.
   */
  needsPlate: boolean;
};

export const partners: { tier: string; logos: PartnerLogo[] }[] = [
  {
    tier: "Współorganizatorzy",
    logos: [
      {
        name: "Uniwersytet Zielonogórski",
        src: uniwersytetZielonogorski,
        needsPlate: true,
      },
    ],
  },
  {
    tier: "Partnerzy",
    logos: [
      {
        name: "Planetarium Wenus",
        src: planetariumWenus,
        needsPlate: false,
      },
      {
        name: "Zielonogórski Ośrodek Kultury",
        src: zok,
        needsPlate: true,
      },
    ],
  },
  {
    tier: "Patroni medialni",
    logos: [
      {
        name: "Fahrenheit",
        src: fahrenheit,
        needsPlate: true,
      },
      {
        name: "Konwenty Południowe",
        src: konwentyPoludniowe,
        needsPlate: true,
      },
    ],
  },
];

/** The pre-polish variants list partners as text; keep them on real data. */
export const partnerNames = partners.map(({ tier, logos }) => ({
  tier,
  names: logos.map((logo) => logo.name),
}));

export const cityFunding = {
  name: "Zrealizowano przy pomocy finansowej Miasta Zielona Góra",
  src: miastoZielonaGora,
};

export type NewsItem = { title: string; href: string; date: string };
