import fbNews from "@/content/fb-news.json";
import { fbPostKey, lqipAsset } from "@/utils/lqip";

import { NewsEntry, toNewsDate } from "./newsFormat";

/**
 * A Facebook post captured by `scripts/archive-fb-news.ts` before it rolled
 * out of the feed widget. Its image is mirrored under `public/fb-news/`
 * because the CDN URL it came from expires after a few weeks.
 */
export type ArchivedFbPost = {
  dateTime: string;
  excerpt: string;
  href: string;
  id: string;
  image?: { height: number; src: string; width: number };
  title: string;
};

export function archivedFacebookNews(): NewsEntry[] {
  return (fbNews as ArchivedFbPost[]).map(({ image, ...post }) => ({
    ...post,
    external: true,
    category: "Facebook",
    ...toNewsDate(post.dateTime ? new Date(post.dateTime) : undefined),
    ...(image && {
      image: { ...image, alt: "", blurDataURL: lqipAsset(fbPostKey(post.id))?.blurDataURL },
    }),
  }));
}
