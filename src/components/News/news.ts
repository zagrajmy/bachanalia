import { print } from "graphql/language/printer";

import { Post } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { lqipForWpUrl } from "@/utils/lqip";
import { unshoutName } from "@/utils/unshout";
import { wpUriToPath } from "@/utils/wpUriToPath";

import { fetchFacebookNews } from "./facebookNews";
import { NewsQuery } from "./NewsQuery";
import { NewsEntry, newsExcerpt, toNewsDate } from "./newsFormat";

export { NEWS_PATH, type NewsEntry, decodeEntities, newsExcerpt, toNewsDate } from "./newsFormat";

function toNewsEntry(post: Post): NewsEntry {
  const image = post.featuredImage?.node;
  const width = image?.mediaDetails?.width ?? undefined;
  const height = image?.mediaDetails?.height ?? undefined;

  return {
    id: post.id,
    title: unshoutName(post.title),
    href: wpUriToPath(post.uri),
    ...toNewsDate(post.date ? new Date(post.date) : undefined),
    excerpt: newsExcerpt(post.excerpt),
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
    fetchGraphQL<{ posts: { nodes: Post[] } }>(print(NewsQuery), { first: NEWS_PAGE }),
    fetchFacebookNews(NEWS_PAGE),
  ]);

  return [...(wordpress.posts?.nodes ?? []).map(toNewsEntry), ...facebook]
    .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
    .slice(0, limit);
}
