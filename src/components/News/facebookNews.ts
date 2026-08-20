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
 * `FeedQuery` pulls the mirrored feed page whole — 1.13 MB, the largest body
 * WordPress serves us — and a short read is indistinguishable from a complete
 * one until `JSON.parse` runs off the end of it. The prerender that died
 * stopped at position 983040, exactly 960 KiB, so `fetchGraphQL`'s retry
 * ladder had nothing transient left to retry.
 *
 * It is the one fetch on this page with a local copy behind it: `fb-news.json`
 * is the durable record and the scrape only adds posts too new to be in it, so
 * a dead feed costs the newest few posts until the next revalidation. Throwing
 * from a prerender costs the deploy.
 */
async function liveFeedHtml(): Promise<string> {
  try {
    return feedContent(await fetchGraphQL(FeedQuery, { uri: FEED_PAGE_URI }));
  } catch (error) {
    // oxlint-disable-next-line no-console -- says which deploy degraded; the daily archive job is what catches a feed that stays dead
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
