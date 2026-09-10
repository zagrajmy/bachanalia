import Link from "next/link";

import { PartnerMark } from "./PartnerMark";
import { FUNDING } from "@/content/partners";

export function FundingStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 py-5">
      {FUNDING.map((logo) => (
        <Link
          key={logo.name}
          href={logo.href}
          rel="noreferrer"
          target="_blank"
          className="group no-underline"
        >
          <PartnerMark
            alt={logo.name}
            box="aspect-square w-[min(320px,72vw)] border border-transparent group-hover:border-dashed group-hover:border-navy/30"
            logo={logo}
            style={{ maxHeight: "100%" }}
          />
        </Link>
      ))}
    </div>
  );
}
