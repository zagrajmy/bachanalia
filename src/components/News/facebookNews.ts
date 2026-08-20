import { feedContent, FeedQuery } from "@/queries/general/FeedQuery";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { fbPostKey, lqipAsset } from "@/utils/lqip";

import { FEED_PAGE_URI, parseFeedItems } from "./facebookFeed";
import { archivedFacebookNews } from "./fbArchive";
import { NewsEntry } from "./newsFormat";

async function withLiveImages(entries: NewsEntry[]) {
  const alive = await Promise.all(
    entries.map(async (entry) =>
      entry.image
        ? fetch(entry.image.src, { method: "HEAD" }).then(
            (response) => response.ok,
            () => false,
          )
        : Promise.resolve(false),
    ),
  );

  return entries.map((entry, i) => {
    if (!alive[i] || !entry.image) return { ...entry, image: undefined };

    const placeholder = lqipAsset(fbPostKey(entry.id));

    return {
      ...entry,
      image: {
        ...entry.image,
        blurDataURL: placeholder?.blurDataURL,
        width: placeholder?.width ?? 720,
        height: placeholder?.height ?? 720,
      },
    };
  });
}

/**
 * The mirrored feed page is a megabyte of widget markup, by some margin the
 * largest thing WordPress serves us, and this host rate-limits bursts and drops
 * connections under a prerender's concurrency. A body that arrives short is
 * indistinguishable from a whole one until `JSON.parse` reaches the end of it,
 * so the failure surfaces here as a `SyntaxError` rather than a dead socket,
 * and `fetchGraphQL`'s retries cannot help when whatever truncated it is
 * deterministic.
 *
 * It is also the only fetch on the home page with a local copy to fall back on.
 * `fb-news.json` is the durable record and the scrape only adds posts too new
 * to have been archived yet, so losing it costs the newest few Facebook posts
 * until the next revalidation — cheap next to losing the deploy, which is what
 * throwing from a prerender costs.
 */
async function liveFeedHtml(): Promise<string> {
  try {
    return feedContent(await fetchGraphQL(FeedQuery, { uri: FEED_PAGE_URI }));
  } catch (error) {
    // oxlint-disable-next-line no-console -- a silent fallback is how a permanently dead feed goes unnoticed
    console.error("Facebook feed unavailable, serving the archive alone:", error);
    return "";
  }
}

export async function fetchFacebookNews(limit: number): Promise<NewsEntry[]> {
  const archived = archivedFacebookNews();
  const known = new Set(archived.map((entry) => entry.id));
  const live = parseFeedItems(await liveFeedHtml()).filter((entry) => !known.has(entry.id));

  return [...(await withLiveImages(live)), ...archived]
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    .slice(0, limit);
}
