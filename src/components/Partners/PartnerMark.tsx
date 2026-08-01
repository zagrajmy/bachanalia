import Image from "next/image";

import { PartnerLogo } from "./partnersContent";

/**
 * Wordmarks carry their weight in width; compact marks need more height to
 * match. Same reasoning as the homepage card, a size up — here the logos are
 * the content rather than a footnote.
 */
function cap({ dimensions }: PartnerLogo) {
  const ratio = dimensions ? dimensions.width / dimensions.height : 1;
  if (ratio >= 3.5) return "clamp(34px, 5.2vw, 52px)";
  if (ratio >= 1.5) return "clamp(44px, 7vw, 70px)";
  return "clamp(60px, 9.5vw, 92px)";
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
      {logo.dimensions ? (
        <Image
          alt=""
          className="max-w-full object-contain"
          height={logo.dimensions.height}
          sizes="(min-width: 640px) 360px, 45vw"
          src={logo.src}
          style={{ height: "auto", maxHeight: cap(logo), width: "auto" }}
          width={logo.dimensions.width}
        />
      ) : (
        <Image alt="" className="object-contain" fill sizes="120px" src={logo.src} />
      )}
    </span>
  );
}
