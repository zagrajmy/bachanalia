import type { Metadata } from "next";

import { ALL_VARIANTS } from "@/components/design/gallery";

export const metadata: Metadata = {
  title: "Warianty projektu",
  robots: { index: false, follow: false },
};

export default function DesignGallery() {
  const groups = [
    { generation: "Po szlifie", items: ALL_VARIANTS.filter((v) => !v.slug.endsWith("-previous")) },
    {
      generation: "Przed szlifem",
      items: ALL_VARIANTS.filter((v) => v.slug.endsWith("-previous")),
    },
  ];

  return (
    <div className="flex h-screen bg-navy text-paper">
      <nav
        aria-label="Warianty"
        className="w-52 shrink-0 overflow-y-auto border-r border-paper/20 p-4"
      >
        {groups.map(({ generation, items }, groupIndex) => (
          <ul key={generation} className={groupIndex > 0 ? "mt-6" : undefined}>
            <li className="px-3 pb-2 text-[0.6875rem] tracking-[0.2em] text-lilac uppercase">
              {generation}
            </li>
            {items.map(({ slug, name, number }) => (
              <li key={slug}>
                <a
                  href={`/design/${slug}/`}
                  target="preview"
                  className="flex items-baseline gap-2.5 rounded-md px-3 py-2 text-sm text-lilac no-underline transition-colors duration-150 hover:bg-navy-deep hover:text-paper focus-visible:bg-navy-deep focus-visible:text-paper"
                >
                  <span className="w-4 shrink-0 text-right text-xs text-accent tabular-nums">
                    {number}
                  </span>
                  {name}
                </a>
              </li>
            ))}
          </ul>
        ))}
      </nav>

      <iframe
        name="preview"
        title="Podgląd wariantu"
        src={`/design/${ALL_VARIANTS[0].slug}/`}
        className="h-full flex-1 border-0 bg-paper"
      />
    </div>
  );
}
