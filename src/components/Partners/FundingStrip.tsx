import Link from "next/link";

import { PartnerMark } from "./PartnerMark";
import { cityFunding } from "@/content/partners";

export function FundingStrip() {
  return (
    <Link
      href={cityFunding.href}
      rel="noreferrer"
      target="_blank"
      className="group flex justify-center items-center gap-5 no-underline py-5"
    >
      <PartnerMark
        box="shrink-0 border border-transparent group-hover:border-dashed group-hover:border-navy/30"
        logo={cityFunding}
        alt={cityFunding.name}
        style={{ height: "min(400px, 90vw)", maxHeight: "400px" }}
      />
    </Link>
  );
}
