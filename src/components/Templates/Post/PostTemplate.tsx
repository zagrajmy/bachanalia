import Image from "next/image";
import { print } from "graphql/language/printer";

import { ContentNode, Post } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { prepareWpContent } from "@/utils/prepareWpContent";

import { PostQuery } from "./PostQuery";

interface TemplateProps {
  node: ContentNode;
}

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function PostTemplate({ node }: TemplateProps) {
  const { post } = await fetchGraphQL<{ post: Post }>(print(PostQuery), {
    id: node.databaseId,
  });

  const published = post.date ? new Date(post.date) : null;
  const image = post.featuredImage?.node;

  return (
    <article className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-14 lg:px-8 lg:py-24">
      {image?.sourceUrl && (
        <Image
          src={image.sourceUrl}
          alt={image.altText || `${post.title}`}
          width={image.mediaDetails?.width ?? 800}
          height={image.mediaDetails?.height ?? 1000}
          sizes="(min-width: 1024px) 20rem, 100vw"
          priority
          className="w-full rounded-card bg-navy-800 object-cover lg:sticky lg:top-28"
        />
      )}

      <div className="min-w-0">
        {published && (
          <time dateTime={published.toISOString()} className="text-sm text-ink-muted">
            {dateFormat.format(published)}
          </time>
        )}

        <h1 className="display mt-3 text-[clamp(2rem,1.4rem+2.6vw,3.25rem)] text-ink">
          {post.title}
        </h1>

        <div
          className="wp-content mt-10"
          dangerouslySetInnerHTML={{ __html: prepareWpContent(post.content) }}
        />
      </div>
    </article>
  );
}
