import Link from "next/link";

import { BlurImg } from "./BlurImg";
import { NewsEntry } from "./news";

type Props = {
  items: NewsEntry[];
  titleAs?: "h2" | "h3";
};

export function NewsList({ items, titleAs = "h3" }: Props) {
  const Title = titleAs;

  return (
    <ul className="mt-8 gap-6 grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
      {items.map((item) => (
        <li className="mb-6 break-inside-avoid lg:mb-8" key={item.id}>
          <Link
            href={item.href}
            {...(item.external && { rel: "noreferrer", target: "_blank" })}
            className="group block no-underline"
          >
            {item.image && (
              <div
                className="overflow-hidden bg-paper-shade"
                style={
                  item.image.width && item.image.height
                    ? { aspectRatio: `${item.image.width} / ${item.image.height}` }
                    : undefined
                }
              >
                <BlurImg
                  alt={item.image.alt}
                  blurDataURL={item.image.blurDataURL}
                  className="h-auto w-full"
                  decoding="async"
                  height={item.image.height}
                  loading="lazy"
                  src={item.image.src}
                  width={item.image.width}
                />
              </div>
            )}

            <Title className="display mt-3 text-[clamp(1.05rem,2.6vw,1.3rem)] text-ink transition-colors hover:duration-0 duration-200 group-hover:text-rose">
              {item.title}
            </Title>

            {item.excerpt && (
              <p className="mt-2 line-clamp-5 text-sm text-ink-muted">{item.excerpt}</p>
            )}

            {item.date && (
              <time
                className="block text-sm mt-2 text-ink-muted tabular-nums"
                dateTime={item.dateTime}
              >
                {item.date}
              </time>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
