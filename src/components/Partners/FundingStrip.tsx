import Link from "next/link";

import { PartnerMark } from "./PartnerMark";
import { PartnerLogo } from "./partnersContent";

/**
 * A logo that WordPress puts above every heading is not a partner tier — it is
 * the city's funding acknowledgement, and the sentence it has to carry is
 * baked into the artwork. Set as text next to the mark it stays readable at
 * any size, and the page ends the way the homepage card does.
 */
export function FundingStrip({ logo }: { logo: PartnerLogo }) {
  const body = (
    <>
      <PartnerMark box="h-20 w-20 shrink-0 sm:h-24 sm:w-24" logo={logo} />
      <span className="max-w-[38ch] text-sm text-ink-muted transition-colors duration-200 group-hover:text-ink">
        {logo.note ?? logo.name}
      </span>
    </>
  );

  return logo.href ? (
    <Link
      href={logo.href}
      {...(logo.href.startsWith("http") ? { rel: "noreferrer", target: "_blank" } : {})}
      className="group flex items-center gap-5 no-underline"
    >
      {body}
    </Link>
  ) : (
    <div className="flex items-center gap-5">{body}</div>
  );
}
