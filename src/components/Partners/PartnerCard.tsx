import Link from "next/link";

import { PartnerMark } from "./PartnerMark";
import type { PartnerLogo } from "@/content/partners";

const CARD =
  "flex h-full flex-col items-center justify-center rounded-card border border-dashed border-navy/30 px-4 py-6 sm:px-5 sm:py-8";

/**
 * The hover moves the rule and the name, never the fill: several of these
 * marks ship baked onto an opaque white rectangle, and tinting the card would
 * make that rectangle appear as a box around them.
 */
export function PartnerCard({ logo }: { logo: PartnerLogo }) {
  const body = (
    <>
      <PartnerMark logo={logo} />
      <span className="mt-4 block text-center text-sm text-ink transition-colors duration-200 group-hover:text-rose">
        {logo.name}
      </span>
    </>
  );

  return logo.href ? (
    <Link
      href={logo.href}
      {...(logo.href.startsWith("http") ? { rel: "noreferrer", target: "_blank" } : {})}
      className={`group no-underline transition-colors duration-200 hover:border-navy ${CARD}`}
    >
      {body}
    </Link>
  ) : (
    <div className={CARD}>{body}</div>
  );
}
