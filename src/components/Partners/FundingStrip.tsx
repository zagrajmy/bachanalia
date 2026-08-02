import Link from "next/link";

import { PartnerMark } from "./PartnerMark";
import { cityFunding } from "@/content/partners";

/**
 * A logo that WordPress puts above every heading is not a partner tier — it is
 * the city's funding acknowledgement, and the sentence it has to carry is
 * baked into the artwork. Set as text next to the mark it stays readable at
 * any size, and the page ends the way the homepage card does.
 */
export function FundingStrip() {
  return (
    <Link
      href={cityFunding.href}
      rel="noreferrer"
      target="_blank"
      className="group flex items-center gap-5 no-underline"
    >
      <PartnerMark box="h-20 w-20 shrink-0 sm:h-24 sm:w-24" logo={cityFunding} />
      <span className="max-w-[38ch] text-sm text-ink-muted transition-colors duration-200 group-hover:text-ink">
        {cityFunding.name}
      </span>
    </Link>
  );
}
