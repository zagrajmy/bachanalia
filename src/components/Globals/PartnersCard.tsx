import Image from "next/image";

import { markHeight } from "@/components/Partners/PartnerMark";
import { PARTNERS } from "@/content/partners";
import type { PartnerLogo } from "@/content/partners";
import { FundingStrip } from "../Partners/FundingStrip";

function Mark({ logo }: { logo: PartnerLogo }) {
  const image = (
    <Image
      src={logo.src}
      alt={logo.name}
      className={`w-auto ${logo.whiteBox ? "mix-blend-multiply" : ""}`}
      style={{ height: markHeight(logo, "footer") }}
    />
  );

  return logo.href ? (
    <a
      href={logo.href}
      target="_blank"
      rel="noreferrer"
      className="p-1 no-underline transition-none outline-1 outline-dashed outline-transparent hover:outline-navy/30"
    >
      {image}
    </a>
  ) : (
    <span className="p-1">{image}</span>
  );
}

export function PartnersCard() {
  return (
    <div className="relative mt-12 overflow-hidden rounded-card bg-paper px-5 py-8 text-navy sm:px-8 sm:py-10">
      <span
        aria-hidden="true"
        className="absolute top-[-13px] left-1/2 size-[26px] -translate-x-1/2 rounded-full bg-navy"
      />
      <span
        aria-hidden="true"
        className="absolute bottom-[-13px] left-1/2 size-[26px] -translate-x-1/2 rounded-full bg-navy"
      />

      <ul className="grid gap-9 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-9">
        {PARTNERS.map(({ tier, logos }) => (
          <li key={tier} className={tier === "Patroni medialni" ? "sm:col-span-2" : ""}>
            <p className="eyebrow text-slate">{tier}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {logos.map((logo) => (
                <Mark key={logo.name} logo={logo} />
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-9 flex items-center justify-center gap-3 border-t border-dashed border-navy/30 pt-6">
        <FundingStrip />
      </div>
    </div>
  );
}
