export const NEWS_PATH = "/aktualnosci/";

export type NewsEntry = {
  id: string;
  title: string;
  href: string;
  date: string;
  dateTime: string;
  excerpt: string;
  category?: string;
  external?: boolean;
  image?: {
    src: string;
    alt: string;
    blurDataURL?: string;
    width?: number;
    height?: number;
  };
};

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const NAMED_ENTITIES: { [name: string]: string } = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "…",
  laquo: "«",
  lt: "<",
  mdash: "—",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  raquo: "»",
};

export function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
    if (!body.startsWith("#")) return NAMED_ENTITIES[body.toLowerCase()] ?? entity;

    const hex = body[1] === "x" || body[1] === "X";
    const codePoint = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);

    return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
  });
}

const EXCERPT_CHARS = 190;

export function newsExcerpt(html?: string | null, maxChars = EXCERPT_CHARS) {
  if (!html) return "";

  const text = decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxChars) return text;

  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  const clipped = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;

  return `${clipped.replace(/[\s.,;:–—-]+$/, "")}…`;
}

export function toNewsDate(published?: Date) {
  return published
    ? { date: dateFormat.format(published), dateTime: published.toISOString() }
    : { date: "", dateTime: "" };
}
