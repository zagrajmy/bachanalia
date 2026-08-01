import gql from "graphql-tag";
import { print } from "graphql/language/printer";

import { fetchGraphQL } from "@/utils/fetchGraphQL";

import { decodeEntities, NewsEntry, newsExcerpt, toNewsDate } from "./news";

/**
 * The con's news lives on Facebook and nowhere else. WordPress's own front
 * page carries the Custom Facebook Feed shortcode, and WPGraphQL hands its
 * rendered markup over like any other content — so the feed arrives through
 * the same cached, retrying request as the rest of the site.
 *
 * The `ad-astra-social-bridge` shortcode on /feed-test/ renders the same posts
 * with no dates and with fbcdn URLs stale enough that most of them 403. This
 * one refreshes.
 */
const FRONT_PAGE_URI = "/";

const FeedQuery = gql`
  query FeedQuery($uri: String!) {
    nodeByUri(uri: $uri) {
      ... on Page {
        content
      }
    }
  }
`;

const ITEM = /<div class="cff-item[\s\S]*?(?=<div class="cff-item|<div class="cff-clear|$)/g;
/** `cff_<page id>_<post id>`, the two halves of a Facebook permalink. */
const POST_ID = /id="cff_(\d+)_(\d+)"/;
const TIMESTAMP = /data-cff-timestamp="(\d+)"/;
const TEXT = /<span class="cff-text"[^>]*>([\s\S]*?)<\/span>/;
/** CFF ships every size as escaped JSON in one attribute. */
const SRC_SET = /data-img-src-set="([^"]*)"/;
const SRC_720 = /"720":"([^"]+)"/;

/** The tag pile at the end of a post is for Facebook's algorithm, not readers. */
const TRAILING_HASHTAGS = /(\s*#[^\s#]+)+\s*$/;

const EXCERPT_CHARS = 300;
/** Facebook posts have no title. The opening sentence is the closest thing. */
const TITLE_CHARS = 80;
/** ❗ and ❓ are single UTF-16 units, so the class is safe without the u flag. */
const SENTENCE_END = /[❗❓!?.](?=\s|$)/;

/** Split at the sentence that opens the post, so the card never says it twice. */
function split(text: string) {
  const end = text.slice(0, TITLE_CHARS + 20).search(SENTENCE_END);

  if (end > 0) {
    return { title: text.slice(0, end + 1), excerpt: newsExcerpt(text.slice(end + 1), EXCERPT_CHARS) };
  }

  if (text.length <= TITLE_CHARS) return { title: text, excerpt: "" };

  const space = text.lastIndexOf(" ", TITLE_CHARS);
  const cut = space > TITLE_CHARS * 0.6 ? space : TITLE_CHARS;

  return { title: `${text.slice(0, cut)}…`, excerpt: newsExcerpt(text.slice(cut), EXCERPT_CHARS) };
}

export function parseFeedItems(html: string): NewsEntry[] {
  return (html.match(ITEM) ?? []).flatMap((item) => {
    const ids = item.match(POST_ID);
    const text = newsExcerpt(item.match(TEXT)?.[1], Number.POSITIVE_INFINITY).replace(
      TRAILING_HASHTAGS,
      "",
    );

    if (!ids || !text) return [];

    const [, pageId, postId] = ids;
    const seconds = Number(item.match(TIMESTAMP)?.[1]);
    /** JSON inside an HTML attribute: entities first, then its escaped slashes. */
    const srcSet = decodeEntities(item.match(SRC_SET)?.[1] ?? "").replace(/\\\//g, "/");
    const src = srcSet.match(SRC_720)?.[1];

    return [
      {
        id: postId,
        href: `https://www.facebook.com/${pageId}/posts/${postId}`,
        external: true,
        ...toNewsDate(seconds ? new Date(seconds * 1000) : undefined),
        category: "Facebook",
        ...split(text),
        /** The feed reports no dimensions; the cards keep whatever shape they have. */
        ...(src && { image: { src, alt: "" } }),
      },
    ];
  });
}

/**
 * fbcdn URLs are signed and expire. CFF refreshes them, but a stale cache on
 * the WordPress side would otherwise leave a row of broken frames — a card
 * without its picture still reads.
 */
async function withLiveImages(entries: NewsEntry[]) {
  const alive = await Promise.all(
    entries.map((entry) =>
      entry.image
        ? fetch(entry.image.src, { method: "HEAD" }).then(
            (response) => response.ok,
            () => false,
          )
        : Promise.resolve(false),
    ),
  );

  return entries.map((entry, i) => (alive[i] ? entry : { ...entry, image: undefined }));
}

export async function fetchFacebookNews(limit: number): Promise<NewsEntry[]> {
  const { nodeByUri } = await fetchGraphQL<{ nodeByUri: { content?: string | null } | null }>(
    print(FeedQuery),
    { uri: FRONT_PAGE_URI },
  );

  return withLiveImages(parseFeedItems(nodeByUri?.content ?? "").slice(0, limit));
}
