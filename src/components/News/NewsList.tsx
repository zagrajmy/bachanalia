import Link from "next/link";

import { NewsEntry } from "./news";

type Props = {
  items: NewsEntry[];
  /** h2 under a page title, h3 under a section heading. */
  titleAs?: "h2" | "h3";
};

/**
 * A board rather than a dated index: the entries come from Facebook, where
 * posts have no titles and no common length. CSS columns give the old site's
 * masonry without a line of JavaScript, and the images keep whatever shape
 * they were posted in — the feed hands over no dimensions to reserve.
 */
export function NewsList({ items, titleAs = "h3" }: Props) {
  const Title = titleAs;

  return (
    <ul className="mt-8 gap-x-6 sm:columns-2 lg:columns-3 lg:gap-x-8">
      {items.map((item) => (
        <li className="mb-6 break-inside-avoid lg:mb-8" key={item.id}>
          <Link
            href={item.href}
            {...(item.external && { rel: "noreferrer", target: "_blank" })}
            className="group block no-underline"
          >
            {item.image && (
              <div className="overflow-hidden bg-paper-shade">
                <img
                  alt={item.image.alt}
                  className="h-auto w-full"
                  decoding="async"
                  loading="lazy"
                  src={item.image.src}
                />
              </div>
            )}

            {item.date && (
              <time
                className="block text-sm mt-4 text-ink-muted tabular-nums"
                dateTime={item.dateTime}
              >
                {item.date}
              </time>
            )}

            <Title className="display mt-3 text-[clamp(1.05rem,2.6vw,1.3rem)] text-ink transition-colors hover:duration-0 duration-200 group-hover:text-rose">
              {item.title}
            </Title>

            {item.excerpt && (
              <p className="mt-1.5 line-clamp-5 text-sm text-ink-muted">
                {item.excerpt}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
