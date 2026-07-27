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
    <article className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <h1 className="display text-[clamp(2.25rem,1.5rem+3vw,3.75rem)] text-ink">{page?.title}</h1>

      {hasVisibleContent(content) ? (
        <div className="wp-content mt-12" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <p className="mt-8 max-w-[55ch] text-lg text-ink-muted">
          Szykujemy tę stronę na XL edycję. Zajrzyj tu ponownie za jakiś czas.
        </p>
      )}
    </article>
  );
}
