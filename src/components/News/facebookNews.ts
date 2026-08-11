import { feedContent, FeedQuery } from "@/queries/general/FeedQuery";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { fbPostKey, lqipAsset } from "@/utils/lqip";

import { FEED_PAGE_URI, parseFeedItems } from "./facebookFeed";
import { archivedFacebookNews } from "./fbArchive";
import { NewsEntry } from "./newsFormat";

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

export async function fetchFacebookNews(limit: number): Promise<NewsEntry[]> {
  const feed = await fetchGraphQL(FeedQuery, { uri: FEED_PAGE_URI });

  const archived = archivedFacebookNews();
  const known = new Set(archived.map((entry) => entry.id));
  const live = parseFeedItems(feedContent(feed)).filter((entry) => !known.has(entry.id));

  return [...(await withLiveImages(live)), ...archived]
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    .slice(0, limit);
}
