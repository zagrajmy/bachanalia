import { ContentNodeResult } from "@/queries/general/ContentQuery";
import { hasVisibleContent, prepareWpContent } from "@/utils/prepareWpContent";

interface TemplateProps {
  node: ContentNodeResult;
}

export default function PageTemplate({ node }: TemplateProps) {
  const content = prepareWpContent(node.content);

  return (
    <article className="gutter mx-auto max-w-6xl pt-12 pb-4 sm:pt-16">
      <h1 className="display -ml-[0.04em] border-b-2 border-navy pb-3 text-[clamp(2.1rem,6.4vw,4rem)]">
        {node.title}
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
