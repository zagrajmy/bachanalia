import Link from "next/link";

import { NEWS_PATH, NewsEntry } from "./news";
import { NewsList } from "./NewsList";

export function NewsSection({ items }: { items: NewsEntry[] }) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="aktualnosci" className="gutter pt-14 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b-2 border-navy pb-3">
          <h2 id="aktualnosci" className="display -ml-[0.04em] text-[clamp(1.7rem,4.6vw,2.7rem)]">
            Aktualności
          </h2>
          <Link
            href={NEWS_PATH}
            className="eyebrow text-ink no-underline underline-offset-[0.4em] hover:underline"
          >
            Wszystkie aktualności
          </Link>
        </div>

        <NewsList items={items} />
      </div>
    </section>
  );
}
