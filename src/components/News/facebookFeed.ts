import { decodeEntities, NewsEntry, newsExcerpt, toNewsDate } from "./newsFormat";

/**
 * An unlinked page holding `[custom-facebook-feed feed=2]` — a clone of the
 * homepage feed with a 50-post window, so the site and the archiver see far
 * more history than the homepage widget's 9.
 */
export const FEED_PAGE_URI = "/index.php/feed-archiwum/";

const ITEM = /<div class="cff-item[\s\S]*?(?=<div class="cff-item|<div class="cff-clear|$)/g;
/** Recent posts render as `cff_<pageId>_<postId>`, older ones as `cff_<postId>`. */
const POST_ID = /id="cff_(?:(\d+)_)?(\d+)"/;
const TIMESTAMP = /data-cff-timestamp="(\d+)"/;
const TEXT = /<span class="cff-text"[^>]*>([\s\S]*?)<\/span>/;
const SRC_SET = /data-img-src-set="([^"]*)"/;
const SRC_720 = /"720":"([^"]+)"/;
const TRAILING_HASHTAGS = /(\s*#[^\s#]+)+\s*$/;

const EXCERPT_CHARS = 300;
const TITLE_CHARS = 80;
const SENTENCE_END = /[❗❓!?.](?=\s|$)/;

function split(text: string) {
  const end = text.slice(0, TITLE_CHARS + 20).search(SENTENCE_END);

  if (end > 0) {
    return {
      title: text.slice(0, end + 1),
      excerpt: newsExcerpt(text.slice(end + 1), EXCERPT_CHARS),
    };
  }

  if (text.length <= TITLE_CHARS) return { title: text, excerpt: "" };

  const space = text.lastIndexOf(" ", TITLE_CHARS);
  const cut = space > TITLE_CHARS * 0.6 ? space : TITLE_CHARS;

  return { title: `${text.slice(0, cut)}…`, excerpt: newsExcerpt(text.slice(cut), EXCERPT_CHARS) };
}

export function parseFeedItems(html: string): NewsEntry[] {
  return (html.match(ITEM) ?? []).flatMap((item) => {
    const ids = POST_ID.exec(item);
    const text = newsExcerpt(TEXT.exec(item)?.[1], Number.POSITIVE_INFINITY).replace(
      TRAILING_HASHTAGS,
      "",
    );

    if (!ids || !text) return [];

    const [, pageId, postId] = ids;
    const seconds = Number(TIMESTAMP.exec(item)?.[1]);
    const srcSet = decodeEntities(SRC_SET.exec(item)?.[1] ?? "").replaceAll("\\/", "/");
    const src = SRC_720.exec(srcSet)?.[1];

    return [
      {
        id: postId,
        href: pageId
          ? `https://www.facebook.com/${pageId}/posts/${postId}`
          : `https://www.facebook.com/${postId}`,
        external: true,
        ...toNewsDate(seconds ? new Date(seconds * 1000) : undefined),
        category: "Facebook",
        ...split(text),
        ...(src && { image: { src, alt: "" } }),
      },
    ];
  });
}
