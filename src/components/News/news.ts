import type { NewsQueryQuery } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { lqipForWpUrl } from "@/utils/lqip";
import { unshoutName } from "@/utils/unshout";
import { wpUriToPath } from "@/utils/wpUriToPath";

import { fetchFacebookNews } from "./facebookNews";
import { NewsQuery } from "./NewsQuery";
import { NewsEntry, newsExcerpt, toNewsDate } from "./newsFormat";

export { decodeEntities, NEWS_PATH, type NewsEntry, newsExcerpt, toNewsDate } from "./newsFormat";

type NewsPost = NonNullable<NewsQueryQuery["posts"]>["nodes"][number];

function toNewsEntry(post: NewsPost): NewsEntry {
  const image = post.featuredImage?.node;
  const width = image?.mediaDetails?.width ?? undefined;
  const height = image?.mediaDetails?.height ?? undefined;

  return {
    id: post.id,
    title: unshoutName(post.title),
    href: wpUriToPath(post.uri),
    ...toNewsDate(post.dateGmt ? new Date(`${post.dateGmt}Z`) : undefined),
    excerpt: newsExcerpt(post.excerpt),
    // oxlint-disable-next-line typescript/no-unnecessary-condition -- WPGraphQL declares this non-null; a plugin that disagrees costs a crash, not a warning
    category: post.categories?.nodes?.[0]?.name ?? undefined,
    ...(image?.sourceUrl && {
      image: {
        src: image.sourceUrl,
        alt: image.altText || "",
        blurDataURL: lqipForWpUrl(image.sourceUrl),
        ...(width && height ? { width, height } : {}),
      },
    }),
  };
}

const NEWS_PAGE = 12;

export async function fetchNews(limit = NEWS_PAGE): Promise<NewsEntry[]> {
  const [wordpress, facebook] = await Promise.all([
    fetchGraphQL(NewsQuery, { first: limit }),
    fetchFacebookNews(limit),
  ]);

  return [...(wordpress.posts?.nodes ?? []).map(toNewsEntry), ...facebook]
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    .slice(0, limit);
}
