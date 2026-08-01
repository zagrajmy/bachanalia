import type { Metadata } from "next";

import { FundingStrip } from "@/components/Partners/FundingStrip";
import { PartnerCard } from "@/components/Partners/PartnerCard";
import { fetchPartners } from "@/components/Partners/partnersContent";

export const metadata: Metadata = {
  alternates: { canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/wspieraja-nas/` },
  title: "Wspierają nas",
};

export const revalidate = 3600;

const idx = (i: number) => String(i + 1).padStart(2, "0");

export default async function WspierajaNasPage() {
  const page = await fetchPartners();
  const tiers = page?.tiers ?? [];
  const lead = page?.lead ?? [];
  const count = tiers.reduce((total, tier) => total + tier.logos.length, 0);

  return (
    <div className="gutter mx-auto max-w-6xl pt-12 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-navy pb-3">
        <h1 className="display -ml-[0.04em] text-[clamp(2.1rem,6.4vw,4rem)]">Wspierają nas</h1>
        {count > 0 && (
          <p className="max-w-[34ch] text-sm text-ink-muted">
            XL edycja powstaje dzięki tym instytucjom, partnerom i patronom.
          </p>
        )}
      </div>

      {count === 0 ? (
        <p className="mt-8 max-w-[55ch] text-lg text-ink-muted">
          Lista partnerów XL edycji pojawi się tutaj, gdy tylko ją domkniemy.
        </p>
      ) : (
        tiers.map((tier, i) => (
          <section className="mt-12 sm:mt-16" key={tier.title}>
            <div className="flex items-baseline justify-between gap-4 border-b border-dashed border-navy/30 pb-2">
              <h2 className="display text-[clamp(1.5rem,4vw,2.2rem)]">{tier.title}</h2>
              <span className="eyebrow text-ink-muted tabular-nums">{idx(i)}</span>
            </div>

            <ul className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
              {tier.logos.map((logo) => (
                <li key={logo.src}>
                  <PartnerCard logo={logo} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      {lead.length > 0 && (
        <div className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-dashed border-navy/30 pt-8 sm:mt-20">
          {lead.map((logo) => (
            <FundingStrip key={logo.src} logo={logo} />
          ))}
        </div>
      )}
    </div>
  );
}
