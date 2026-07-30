import { print } from "graphql/language/printer";

import { Post } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { wpUriToPath } from "@/utils/wpUriToPath";

import { NewsQuery } from "./NewsQuery";

export const NEWS_PATH = "/aktualnosci/";

/** The con announces most things here first; the archive links back to it. */
export const FACEBOOK_URL = "https://www.facebook.com/BachanaliaFantastyczne/";

export type NewsEntry = {
  id: string;
  title: string;
  href: string;
  /** Reader-facing label, e.g. "15 września 2025". */
  date: string;
  /** Machine-readable timestamp for `<time datetime>`. */
  dateTime: string;
  excerpt: string;
  category?: string;
  image?: { src: string; alt: string; width: number; height: number };
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

/** WordPress excerpts arrive as HTML with numeric entities for every dash and quote. */
function decodeEntities(text: string) {
  return text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, body: string) => {
    if (!body.startsWith("#")) return NAMED_ENTITIES[body.toLowerCase()] ?? entity;

    const hex = body[1] === "x" || body[1] === "X";
    const codePoint = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);

    return Number.isNaN(codePoint) ? entity : String.fromCodePoint(codePoint);
  });
}

const EXCERPT_CHARS = 190;

/**
 * Editors leave the excerpt empty, so WordPress derives it from the whole post
 * body — hundreds of words of HTML. Rows need two lines of plain text.
 */
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

function toNewsEntry(post: Post): NewsEntry {
  const image = post.featuredImage?.node;
  const published = post.date ? new Date(post.date) : undefined;

  return {
    id: post.id,
    title: post.title ?? "",
    href: wpUriToPath(post.uri),
    date: published ? dateFormat.format(published) : "",
    dateTime: published ? published.toISOString() : "",
    excerpt: newsExcerpt(post.excerpt),
    category: post.categories?.nodes?.[0]?.name ?? undefined,
    ...(image?.sourceUrl && {
      image: {
        src: image.sourceUrl,
        alt: image.altText || "",
        width: image.mediaDetails?.width ?? 800,
        height: image.mediaDetails?.height ?? 600,
      },
    }),
  };
}

/**
 * One page's worth of announcements, for everyone. Varying `first` would give
 * each caller its own URL and its own trip to WordPress; that server
 * rate-limits bursts hard enough to fail a prerender, so the home teaser
 * slices this list rather than asking for a shorter one.
 */
const NEWS_PAGE = 12;

/** `g23`, `gosc24`, `gosc25`, `gosc26` — one per edition, and more will follow. */
const GUEST_CATEGORY = /^g(osc)?\d{2}$/;

/**
 * Every post in WordPress is a guest profile filed under an edition's
 * category; there is not one actual announcement among them. Listing them as
 * "Aktualności" would put last year's guest list under this year's news, and
 * duplicate /goscie/ while doing it.
 */
export function isNews(post: Post) {
  return !(post.categories?.nodes ?? []).some((c) => c?.slug && GUEST_CATEGORY.test(c.slug));
}

export async function fetchNews(limit = NEWS_PAGE): Promise<NewsEntry[]> {
  const { posts } = await fetchGraphQL<{ posts: { nodes: Post[] } }>(print(NewsQuery), {
    first: NEWS_PAGE,
  });

  return (posts?.nodes ?? []).filter(isNews).slice(0, limit).map(toNewsEntry);
}
