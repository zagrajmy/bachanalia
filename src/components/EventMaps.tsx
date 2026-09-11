import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/SectionHeading";
import { PROGRAM_URL } from "@/components/Globals/siteNav";
import { MAPS } from "@/content/maps";

/**
 * A plan is only useful at a size a phone cannot show, so each one opens at
 * full resolution in its own tab — the browser's own image view pans and
 * zooms better than anything worth writing here.
 */
export function EventMaps() {
  return (
    <section className="mt-14 sm:mt-20">
      <SectionHeading
        aside={
          <Link
            href={`${PROGRAM_URL}maps/`}
            rel="noreferrer"
            target="_blank"
            className="text-sm text-ink-muted underline-offset-[0.25em] decoration-dashed hover:text-rose"
          >
            Mapy z programem
          </Link>
        }
      >
        Mapy
      </SectionHeading>

      <ul className="mt-6 grid list-none grid-cols-1 gap-4 p-0 sm:mt-8 md:grid-cols-2">
        {MAPS.map((map) => (
          <li key={map.name}>
            <a
              href={map.src.src}
              rel="noreferrer"
              target="_blank"
              className="group block overflow-hidden rounded-card border border-dashed border-navy/30 no-underline transition-colors duration-200 hover:border-navy"
            >
              <Image
                alt={map.name}
                src={map.src}
                placeholder="blur"
                sizes="(min-width: 768px) 45vw, 92vw"
                className="w-full cursor-zoom-in"
              />
              <span className="block px-4 py-3 text-sm text-ink transition-colors duration-200 group-hover:text-rose">
                {map.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
