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

  return (
    <article className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
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
    </article>
  );
}
