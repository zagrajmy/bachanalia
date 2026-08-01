const DROPPED_ATTRIBUTES = [
  / role="region"(?= aria-roledescription="carousel")/g,
  / aria-roledescription="(?:carousel|slide)"/g,
  / aria-label="Karuzela obrazków"/g,
  / aria-label="\d+ z \d+"/g,
  / aria-live="off"/g,
  /(?<=<div class="swiper-slide") role="group"/g,
];

export const prepareWpContent = (html?: string | null) =>
  DROPPED_ATTRIBUTES.reduce<string>((acc, pattern) => acc.replace(pattern, ""), html ?? "");

const MEDIA = /<(?:img|iframe|video|audio|picture|svg)\b/i;

export const hasVisibleContent = (html?: string | null) => {
  if (!html) return false;
  if (MEDIA.test(html)) return true;

  return (
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0
  );
};

export interface WpGalleryImage {
  src: string;
  alt: string;
}

export type WpContentSegment =
  | { type: "html"; html: string }
  | { type: "gallery"; images: WpGalleryImage[] };

/** Elementor's carousel wrapper, the element whose subtree holds the slides. */
const CAROUSEL_CLASS = "elementor-image-carousel-wrapper";

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

/** Comments first, so a `<` inside one never starts a tag. */
const TAG = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:'[^']*'|"[^"]*"|[^'">])*)>/g;

const IMG = /<img\b[^>]*>/gi;

const decodeEntities = (value: string) =>
  value
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const attribute = (tag: string, name: string) =>
  new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1];

const galleryImages = (slice: string): WpGalleryImage[] => {
  const images: WpGalleryImage[] = [];

  IMG.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = IMG.exec(slice)) !== null) {
    const src = attribute(match[0], "src");
    if (src) {
      images.push({
        alt: decodeEntities(attribute(match[0], "alt") ?? ""),
        src: decodeEntities(src),
      });
    }
  }

  return images;
};

const closeAll = (names: readonly string[]) =>
  names
    .map((name) => `</${name}>`)
    .reverse()
    .join("");

/**
 * Lifts Elementor's image carousels out of the HTML blob so they can render as
 * real components — `next/image`, a lightbox — while the rest of the body stays
 * a single `dangerouslySetInnerHTML`.
 *
 * A carousel sits several wrappers deep, so cutting the string there would leave
 * both halves unbalanced. The scanner keeps the stack of open tags, closes it at
 * the cut and reopens it after, which costs nothing visually: every one of those
 * ancestors is `display: contents`.
 *
 * Chunks with nothing visible in them are dropped, so a page that is only
 * wrappers still comes back empty and the "not written yet" copy still shows.
 */
export const splitWpContent = (html?: string | null): WpContentSegment[] => {
  const source = prepareWpContent(html);
  if (!source.includes(CAROUSEL_CLASS)) {
    return hasVisibleContent(source) ? [{ type: "html", html: source }] : [];
  }

  const segments: WpContentSegment[] = [];
  const openTags: string[] = [];
  const openNames: string[] = [];

  let cursor = 0;
  let reopen = "";
  let galleryStart = -1;
  let galleryDepth = 0;

  const pushHtml = (chunk: string) => {
    if (hasVisibleContent(chunk)) segments.push({ type: "html", html: chunk });
  };

  TAG.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG.exec(source)) !== null) {
    const [raw, closing, rawName, attrs] = match;
    if (rawName === undefined) continue;

    const name = rawName.toLowerCase();

    if (closing) {
      const at = openNames.lastIndexOf(name);
      if (at === -1) continue;

      openNames.length = at;
      openTags.length = at;

      if (galleryStart !== -1 && at === galleryDepth) {
        const end = match.index + raw.length;

        pushHtml(reopen + source.slice(cursor, galleryStart) + closeAll(openNames));
        segments.push({ type: "gallery", images: galleryImages(source.slice(galleryStart, end)) });

        reopen = openTags.join("");
        cursor = end;
        galleryStart = -1;
      }

      continue;
    }

    if (VOID_ELEMENTS.has(name) || attrs.trimEnd().endsWith("/")) continue;

    if (galleryStart === -1 && attrs.includes(CAROUSEL_CLASS)) {
      galleryStart = match.index;
      galleryDepth = openNames.length;
    }

    openNames.push(name);
    openTags.push(raw);
  }

  pushHtml(reopen + source.slice(cursor));

  return segments;
};
