import Image from "next/image";

import type { PartnerLogo } from "@/content/partners";

/**
 * Wordmarks carry their weight in width; compact marks need more height to
 * match. The footer card is the same ladder a size down, which is why the
 * scale is a parameter rather than a second copy of these thresholds.
 */
export type MarkScale = "footer" | "page";

const HEIGHTS: Record<MarkScale, [string, string, string]> = {
  page: ["clamp(34px, 5.2vw, 52px)", "clamp(44px, 7vw, 70px)", "clamp(60px, 9.5vw, 92px)"],
  footer: ["clamp(28px, 5.4vw, 42px)", "clamp(36px, 6.6vw, 54px)", "clamp(48px, 8.6vw, 72px)"],
};

export function markHeight(logo: PartnerLogo, scale: MarkScale = "page") {
  const ratio = logo.src.width / logo.src.height;
  const [wide, medium, compact] = HEIGHTS[scale];
  const height = ratio >= 4 ? wide : ratio >= 1.5 ? medium : compact;

  return logo.narrow ? `calc(${height} * 1.35)` : height;
}

/**
 * Every mark sits in a box of one height, so the whole page shares a baseline
 * whatever shape an organisation's logo happens to be. The name is always
 * printed next to it, so the image itself is decorative.
 */
export function PartnerMark({
  box = "h-24 w-full sm:h-28",
  logo,
}: {
  box?: string;
  logo: PartnerLogo;
}) {
  return (
    <span className={`relative flex items-center justify-center ${box}`}>
      <Image
        alt=""
        className={`max-w-full object-contain ${logo.whiteBox ? "mix-blend-multiply" : ""}`}
        sizes="(min-width: 640px) 360px, 45vw"
        src={logo.src}
        style={{ height: "auto", maxHeight: markHeight(logo), width: "auto" }}
      />
    </span>
  );
}
