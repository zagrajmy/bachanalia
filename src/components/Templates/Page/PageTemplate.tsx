import { print } from "graphql/language/printer";

import { ContentNode, Page } from "@/gql/graphql";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { hasVisibleContent, prepareWpContent } from "@/utils/prepareWpContent";

import { PageQuery } from "./PageQuery";

interface TemplateProps {
  node: ContentNode;
}

export default async function PageTemplate({ node }: TemplateProps) {
  const { page } = await fetchGraphQL<{ page: Page }>(print(PageQuery), {
    id: node.databaseId,
  });

  const content = prepareWpContent(page?.content);

  return (
    <article className="gutter mx-auto max-w-6xl pt-12 pb-4 sm:pt-16">
      <h1 className="display -ml-[0.04em] border-b-2 border-navy pb-3 text-[clamp(2.1rem,6.4vw,4rem)]">
        {page?.title}
      </h1>

      {hasVisibleContent(content) ? (
        <div className="wp-content mt-10" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p className="mt-8 max-w-[55ch] text-lg text-ink-muted">
          Szykujemy tę stronę na XL edycję. Zajrzyj tu ponownie za jakiś czas.
        </p>
      )}
    </article>
  );
}
