import Image from "next/image";

import { cityFunding, PartnerLogo, partners } from "@/content/con";

/** Wordmarks carry their weight in width; compact marks need more height to match. */
function logoHeight({ width, height }: PartnerLogo["src"]) {
  const ratio = width / height;
  if (ratio >= 3.5) return "clamp(22px, 4.2vw, 32px)";
  if (ratio >= 1.5) return "clamp(28px, 5vw, 40px)";
  return "clamp(38px, 6.6vw, 54px)";
}

export function PartnersCard() {
  return (
    <div className="relative mt-12 overflow-hidden rounded-card bg-paper px-5 py-8 text-navy sm:px-8 sm:py-10">
      <span
        aria-hidden="true"
        className="absolute -top-[13px] left-1/2 h-[26px] w-[26px] -translate-x-1/2 rounded-full bg-navy"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-[13px] left-1/2 h-[26px] w-[26px] -translate-x-1/2 rounded-full bg-navy"
      />

      <ul className="grid gap-9 sm:grid-cols-3 sm:gap-8">
        {partners.map(({ tier, logos }) => (
          <li key={tier}>
            <p className="eyebrow text-slate">{tier}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-5">
              {logos.map((logo) => (
                <Image
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  className={`w-auto ${logo.whiteBox ? "mix-blend-multiply" : ""}`}
                  style={{ height: logoHeight(logo.src) }}
                />
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-9 flex items-center gap-4 border-t border-dashed border-navy/30 pt-6">
        <Image
          src={cityFunding.src}
          alt={cityFunding.name}
          className="w-auto shrink-0"
          style={{ height: "clamp(36px, 6vw, 48px)" }}
        />
        <p className="max-w-[42ch] text-xs text-slate">{cityFunding.name}</p>
      </div>
    </div>
  );
}
