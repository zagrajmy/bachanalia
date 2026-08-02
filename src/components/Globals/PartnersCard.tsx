import Image from "next/image";

import { markHeight } from "@/components/Partners/PartnerMark";
import { cityFunding, PARTNERS } from "@/content/partners";

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

      <ul className="grid gap-9 sm:grid-cols-3 sm:gap-8">
        {PARTNERS.map(({ tier, logos }) => (
          <li key={tier}>
            <p className="eyebrow text-slate">{tier}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {logos.map((logo) => (
                <a
                  key={logo.name}
                  href={logo.href}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 no-underline transition-none outline-1 outline-dashed outline-transparent hover:outline-navy/20"
                >
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    className={`w-auto ${logo.whiteBox ? "mix-blend-multiply" : ""}`}
                    style={{ height: markHeight(logo, "footer") }}
                  />
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-9 flex items-center gap-4 border-t border-dashed border-navy/30 pt-6">
        <a
          href={cityFunding.href}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 p-1 no-underline transition-none outline-1 outline-dashed outline-transparent hover:outline-navy/20"
        >
          <Image
            src={cityFunding.src}
            alt={cityFunding.name}
            className="w-auto"
            style={{ height: "clamp(58px, 9.4vw, 80px)" }}
          />
        </a>
        <p className="text-xs text-slate">{cityFunding.name}</p>
      </div>
    </div>
  );
}
