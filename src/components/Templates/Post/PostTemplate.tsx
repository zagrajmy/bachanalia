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
    <article className="gutter mx-auto grid max-w-6xl gap-10 pt-12 pb-4 sm:pt-16 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-14">
      {image?.sourceUrl && (
        <Image
          src={image.sourceUrl}
          alt={image.altText || `${post.title}`}
          width={image.mediaDetails?.width ?? 800}
          height={image.mediaDetails?.height ?? 1000}
          sizes="(min-width: 1024px) 20rem, 100vw"
          priority
          className="w-full rounded-card bg-paper-shade object-cover lg:sticky lg:top-28"
        />
      )}

      <div className="min-w-0">
        {published && (
          <time dateTime={published.toISOString()} className="eyebrow text-ink-muted">
            {dateFormat.format(published)}
          </time>
        )}

        <h1 className="display mt-3 -ml-[0.04em] border-b-2 border-navy pb-3 text-[clamp(1.9rem,5.2vw,3rem)]">
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
