export const KEY_ART = "/wp-content/uploads/2026/02/baner_strona_1300x500.jpg";

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

export const partners = [
  { tier: "Współorganizator", names: ["Uniwersytet Zielonogórski"] },
  { tier: "Partner", names: ["Zielonogórski Ośrodek Kultury"] },
  { tier: "Sponsorzy", names: ["Powergraph", "Rebis"] },
  { tier: "Patroni", names: ["Radio Eska", "Informator Konwentowy", "Konwenty Południowe"] },
];

export type NewsItem = { title: string; href: string; date: string };

export const VARIANTS = [
  {
    slug: "plakat",
    name: "Plakat",
    world: "Polska szkoła plakatu",
    thesis:
      "Ilustracja jest stroną, nie nagłówkiem. Kompozycja asymetryczna, typografia malowana skalą, nie ozdobnikiem.",
  },
  {
    slug: "atlas",
    name: "Atlas nieba",
    world: "Mapa nieba i efemerydy",
    thesis:
      "Ad Astra wzięte dosłownie. Siatka współrzędnych, cienkie linie, program czytany jak tabela wschodów i zachodów.",
  },
  {
    slug: "zin",
    name: "Zin",
    world: "Riso i fanzin",
    thesis:
      "Fantazje Zielonogórskie jako język całej strony. Dwie farby, rozjechany druk, blokowy skład i maszynopis.",
  },
  {
    slug: "demoscena",
    name: "Demoscena",
    world: "Ekran ładowania z lat 80.",
    thesis:
      "Retro gaming nie jako blok programu, tylko jako gramatyka strony. Bitmapa, loader, tabela kolorów.",
  },
  {
    slug: "akredytacja",
    name: "Akredytacja",
    world: "Bilet i identyfikator",
    thesis:
      "Strona zbudowana wokół tego, co konwent naprawdę sprzedaje. Perforacja, odcinek kontrolny, taryfikator.",
  },
] as const;

export type VariantSlug = (typeof VARIANTS)[number]["slug"];
