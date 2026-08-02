import type { Metadata } from "next";

import { FundingStrip } from "@/components/Partners/FundingStrip";
import { PartnerCard } from "@/components/Partners/PartnerCard";
import { PARTNERS } from "@/content/partners";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/wspieraja-nas/` },
  title: "Wspierają nas",
};

const idx = (i: number) => String(i + 1).padStart(2, "0");

export default function WspierajaNasPage() {
  return (
    <div className="gutter mx-auto max-w-6xl pt-12 sm:pt-16">
      <SectionHeading
        as="h1"
        size="page"
        aside={
          <p className="max-w-[34ch] text-sm text-ink-muted">
            XL edycja powstaje dzięki tym instytucjom, partnerom i patronom.
          </p>
        }
      >
        Wspierają nas
      </SectionHeading>

      {PARTNERS.map((tier, i) => (
        <section className="mt-12 sm:mt-16" key={tier.tier}>
          <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-navy/30 pb-2">
            <h2 className="display text-[clamp(1.5rem,4vw,2.2rem)]">{tier.tier}</h2>
            <span className="eyebrow text-ink-muted tabular-nums">{idx(i)}</span>
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
            {tier.logos.map((logo) => (
              <li key={logo.name}>
                <PartnerCard logo={logo} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="mt-14 border-t border-dashed border-navy/30 pt-8 sm:mt-20">
        <FundingStrip />
      </div>
    </div>
  );
}
