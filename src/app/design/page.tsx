import type { Metadata } from "next";
import Link from "next/link";

import { VARIANTS } from "@/components/design/content";

export const metadata: Metadata = {
  title: "Warianty projektu",
  robots: { index: false, follow: false },
};

export default function DesignGallery() {
  return (
    <div className="min-h-screen bg-navy-900 text-ink">
      <header className="border-b border-hairline px-6 py-10 lg:px-10">
        <p className="text-xs tracking-[0.24em] text-ink-muted uppercase">Podgląd wewnętrzny</p>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,3.25rem)]">
          Pięć kierunków strony głównej
        </h1>
        <p className="mt-4 max-w-[62ch] text-ink-muted">
          Każdy wariant to osobny świat wizualny wyprowadzony z kultury, którą ta publiczność zna:
          plakat, atlas nieba, fanzin, demoscena i bilet. Ta sama treść i te same fakty w każdym,
          żeby porównanie dotyczyło formy, a nie zawartości.
        </p>
      </header>

      <ul className="divide-y divide-hairline">
        {VARIANTS.map(({ slug, name, world, thesis }, index) => (
          <li key={slug}>
            <section className="px-6 py-12 lg:px-10">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                <span className="text-sm text-accent tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="display text-3xl">{name}</h2>
                <span className="text-sm text-ink-muted">{world}</span>
                <Link
                  href={`/design/${slug}/`}
                  className="ml-auto rounded-full border border-hairline px-4 py-2 text-sm no-underline transition-colors duration-200 hover:border-accent hover:text-accent"
                >
                  Otwórz w pełnym oknie
                </Link>
              </div>

              <p className="mt-3 max-w-[70ch] text-ink-muted">{thesis}</p>

              <div className="mt-7 overflow-hidden rounded-card border border-hairline bg-navy-800">
                <iframe
                  src={`/design/${slug}/`}
                  title={`Podgląd wariantu: ${name}`}
                  loading="lazy"
                  className="h-[560px] w-full"
                />
              </div>
            </section>
          </li>
        ))}
      </ul>
    </div>
  );
}
