import { print } from "graphql/language/printer";

import { Post } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { wpUriToPath } from "@/utils/wpUriToPath";

import { fetchFacebookNews } from "./facebookNews";
import { NewsQuery } from "./NewsQuery";

export const NEWS_PATH = "/aktualnosci/";

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
  /** Facebook posts have no copy on this site; the card leaves for theirs. */
  external?: boolean;
  image?: { src: string; alt: string };
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
export function decodeEntities(text: string) {
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

/** Reader-facing label and machine-readable stamp, or neither. */
export function toNewsDate(published?: Date) {
  return published
    ? { date: dateFormat.format(published), dateTime: published.toISOString() }
    : { date: "", dateTime: "" };
}

function toNewsEntry(post: Post): NewsEntry {
  const image = post.featuredImage?.node;

  return {
    id: post.id,
    title: post.title ?? "",
    href: wpUriToPath(post.uri),
    ...toNewsDate(post.date ? new Date(post.date) : undefined),
    excerpt: newsExcerpt(post.excerpt),
    category: post.categories?.nodes?.[0]?.name ?? undefined,
    ...(image?.sourceUrl && {
      image: { src: image.sourceUrl, alt: image.altText || "" },
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

/**
 * Two archives, one timeline: this year's announcements live on Facebook,
 * last year's are the dated guest posts still in WordPress. Both carry a date,
 * so they interleave rather than sit in separate piles.
 */
export async function fetchNews(limit = NEWS_PAGE): Promise<NewsEntry[]> {
  const [wordpress, facebook] = await Promise.all([
    fetchGraphQL<{ posts: { nodes: Post[] } }>(print(NewsQuery), { first: NEWS_PAGE }),
    fetchFacebookNews(NEWS_PAGE),
  ]);

  return [...(wordpress.posts?.nodes ?? []).map(toNewsEntry), ...facebook]
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    .slice(0, limit);
}
