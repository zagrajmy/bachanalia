import { WpContent } from "@/components/Templates/WpContent";
import { ContentNodeResult } from "@/queries/general/ContentQuery";
import { splitWpContent } from "@/utils/prepareWpContent";
import { unshoutTitle } from "@/utils/unshout";

interface TemplateProps {
  node: ContentNodeResult;
}

export function PageTemplate({ node }: TemplateProps) {
  const segments = splitWpContent(node.content);

  return (
    <article className="gutter mx-auto max-w-6xl pt-12 pb-4 sm:pt-16">
      <h1 className="display ml-[-0.04em] border-b-2 border-navy pb-3 text-[clamp(2.1rem,6.4vw,4rem)]">
        {unshoutTitle(node.title)}
      </h1>

      {segments.length > 0 ? (
        <WpContent segments={segments} className="mt-10" />
      ) : (
        <p className="mt-8 max-w-[55ch] text-lg text-ink-muted">
          Szykujemy tę stronę na XL edycję. Zajrzyj tu ponownie za jakiś czas.
        </p>
      )}
    </article>
  );
}
