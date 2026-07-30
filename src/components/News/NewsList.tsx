import Image from "next/image";
import Link from "next/link";

import { NewsEntry } from "./news";

const idx = (i: number) => String(i + 1).padStart(2, "0");

const Dot = ({ className }: { className?: string }) => (
  <span aria-hidden="true" className={`text-hairline ${className ?? ""}`}>
    ·
  </span>
);

type Props = {
  items: NewsEntry[];
  /** h2 under a page title, h3 under a section heading. */
  titleAs?: "h2" | "h3";
};

export function NewsList({ items, titleAs = "h3" }: Props) {
  const Title = titleAs;

  return (
    <ul>
      {items.map((item, i) => (
        <li key={item.id} className="border-b border-dashed border-navy/25">
          <Link
            href={item.href}
            className="group grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-x-4 py-4 no-underline sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-8 sm:py-5 lg:grid-cols-[10rem_minmax(0,1fr)_12rem] lg:gap-x-10"
          >
            <div className="row-span-2 overflow-hidden rounded-card bg-paper-shade lg:row-span-1">
              {item.image ? (
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  width={item.image.width}
                  height={item.image.height}
                  sizes="(min-width: 640px) 10rem, 4.5rem"
                  className="aspect-[4/3] w-full object-contain"
                />
              ) : (
                <span className="block aspect-[4/3] w-full" />
              )}
            </div>

            <p className="eyebrow flex flex-wrap items-baseline gap-x-2.5 text-ink-muted lg:col-start-3 lg:row-start-1 lg:flex-col lg:items-end lg:gap-y-1.5 lg:pt-1.5">
              <span className="flex items-baseline gap-x-2.5">
                <span className="tabular-nums">{idx(i)}</span>
                <Dot />
                {item.date && (
                  <time dateTime={item.dateTime} className="tabular-nums">
                    {item.date}
                  </time>
                )}
              </span>
              {item.category && (
                <>
                  <Dot className="lg:hidden" />
                  <span>{item.category}</span>
                </>
              )}
            </p>

            <div className="min-w-0 lg:col-start-2 lg:row-start-1">
              <Title className="display mt-2 text-[clamp(1.1rem,3vw,1.5rem)] lg:mt-0 text-ink transition-colors duration-200 group-hover:text-rose">
                {item.title}
              </Title>

              {item.excerpt && (
                <p className="mt-1.5 line-clamp-2 max-w-[74ch] text-sm text-ink-muted sm:line-clamp-3">
                  {item.excerpt}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
