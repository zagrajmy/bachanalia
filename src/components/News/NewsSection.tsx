import Link from "next/link";

import { FACEBOOK_URL, NEWS_PATH, NewsEntry } from "./news";
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
            className="eyebrow text-ink-muted no-underline transition-colors duration-200 hover:text-rose"
          >
            Wszystkie aktualności
          </Link>
        </div>

        <NewsList items={items} />

        <p className="mt-6 text-sm text-ink-muted">
          Najkrótsze wieści trafiają najpierw na{" "}
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-accent decoration-2 underline-offset-[0.2em] transition-colors duration-200 hover:text-rose"
          >
            nasz profil na Facebooku
          </a>
          .
        </p>
      </div>
    </section>
  );
}
