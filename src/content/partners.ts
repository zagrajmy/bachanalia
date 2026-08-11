import type { StaticImageData } from "next/image";

import fahrenheit from "./partners/fahrenheit.png";
import konwentyPoludniowe from "./partners/konwenty-poludniowe.png";
import miastoZielonaGora from "./partners/miasto-zielona-gora.png";
import planetariumWenus from "./partners/planetarium-wenus.png";
import uniwersytetZielonogorski from "./partners/uniwersytet-zielonogorski.jpg";
/** Next types `*.svg` as `any` so `@svgr/webpack` can redefine it; this one is an image. */
import zagrajmySvg from "./partners/zagrajmy.svg";
import zok from "./partners/zok.jpg";

/**
 * Who supports the con, in one place.
 *
 * This was parsed out of WordPress once, and it earned nothing: Elementor's
 * markup names nobody — alt text is empty on five of the seven logos and the
 * upload's filename on the rest, and filenames lie here, `kepler.png` being
 * the Planetarium Wenus mark. So the names lived in code anyway, next to a
 * parser that could break on a plugin update, while the artwork had to be
 * committed regardless. A partner is a deploy either way; this way it is one
 * edit rather than three.
 */
export type PartnerLogo = {
  /** Every mark is somebody's front door; a logo that goes nowhere wastes it. */
  href: string;
  name: string;
  /**
   * A narrow or padded mark reads lighter than a wordmark of the same height,
   * so it takes a taller box to carry the same weight in the row. Ratio alone
   * cannot tell one from a logo that is simply wide, so the mark says so.
   */
  narrow?: boolean;
  src: StaticImageData;
  /**
   * The artwork ships baked onto an opaque white rectangle, so it needs
   * multiplying into the page instead of sitting in a visible box.
   */
  whiteBox?: boolean;
};

export const PARTNERS: { logos: PartnerLogo[]; tier: string }[] = [
  {
    tier: "Współorganizatorzy",
    logos: [
      {
        name: "Uniwersytet Zielonogórski",
        narrow: true,
        src: uniwersytetZielonogorski,
        href: "https://uz.zgora.pl/",
        whiteBox: true,
      },
    ],
  },
  {
    tier: "Partnerzy",
    logos: [
      {
        name: "Planetarium Wenus",
        narrow: true,
        src: planetariumWenus,
        href: "https://centrumnaukikeplera.pl/planetarium-wenus/",
      },
      {
        name: "Zielonogórski Ośrodek Kultury",
        narrow: true,
        src: zok,
        href: "https://zok.com.pl/",
        whiteBox: true,
      },
      {
        name: "zagrajmy.net",
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Next types `*.svg` as `any` so svgr can redefine it
        src: zagrajmySvg as StaticImageData,
        href: "https://zagrajmy.net/",
      },
    ],
  },
  {
    tier: "Patroni medialni",
    logos: [
      {
        name: "Fahrenheit",
        src: fahrenheit,
        href: "https://fahrenheit.net.pl/",
      },
      {
        name: "Konwenty Południowe",
        src: konwentyPoludniowe,
        href: "https://konwenty-poludniowe.pl/",
      },
    ],
  },
];

/** The sentence is baked into the artwork, so the page sets it as text too. */
export const cityFunding = {
  name: "Zrealizowano przy pomocy finansowej Miasta Zielona Góra",
  src: miastoZielonaGora,
  href: "https://zielona-gora.pl/",
};
