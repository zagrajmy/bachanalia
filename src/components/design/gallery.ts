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

export const ALL_VARIANTS = [
  ...VARIANTS.map(({ slug, name }) => ({ slug, name, generation: "Po szlifie" })),
  ...VARIANTS.map(({ slug, name }) => ({
    slug: `${slug}-previous`,
    name,
    generation: "Przed szlifem",
  })),
].map((variant, index) => ({ ...variant, number: index + 1 }));
