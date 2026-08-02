import Link from "next/link";

import { NEWS_PATH, NewsEntry } from "./news";
import { SectionHeading } from "@/components/SectionHeading";

import { NewsList } from "./NewsList";

export function NewsSection({ items }: { items: NewsEntry[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="aktualnosci" className="gutter pt-14 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="aktualnosci"
          aside={
            <Link
              href={NEWS_PATH}
              className="eyebrow text-ink no-underline underline-offset-[0.4em] hover:underline"
            >
              Wszystkie aktualności
            </Link>
          }
        >
          Aktualności
        </SectionHeading>

        <NewsList items={items} />
      </div>
    </section>
  );
}
