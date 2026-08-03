/**
 * WordPress and WooCommerce hand back HTML in places that are documented as
 * text: a post excerpt, an image `alt`, a cart error. Three copies of "strip
 * the tags and decode the entities" had grown around the repo; this is the one.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "…",
  laquo: "«",
  ldquo: "“",
  lsquo: "‘",
  lt: "<",
  mdash: "—",
  nbsp: " ",
  ndash: "–",
  quot: '"',
  raquo: "»",
  rdquo: "”",
  rsquo: "’",
  bdquo: "„",
  sbquo: "‚",
};

/**
 * Anything unrecognised is left exactly as it arrived. A literal `&zzzz;` in
 * body copy is somebody's typo to see, not ours to swallow.
 */
export function decodeEntities(text: string) {
  return text.replaceAll(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
    if (!body.startsWith("#")) return NAMED_ENTITIES[body.toLowerCase()] ?? entity;

    const hex = body[1] === "x" || body[1] === "X";
    const codePoint = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);

    return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
  });
}

/** Tags out, entities in, whitespace collapsed — what a `<p>` would have shown. */
export function htmlToText(html?: string | null) {
  if (!html) return "";

  return decodeEntities(html.replaceAll(/<[^>]*>/g, " "))
    .replaceAll(/\s+/g, " ")
    .trim();
}
