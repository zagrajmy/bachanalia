import type { StaticImageData } from "next/image";

import fahrenheit from "./partners/fahrenheit.png";
import konwentyPoludniowe from "./partners/konwenty-poludniowe.png";
import miastoZielonaGora from "./partners/miasto-zielona-gora.png";
import otwarteKomiksy from "./partners/otwarte-komiksy.png";
import perAsperaSvg from "./partners/per-aspera.svg";
import planetariumWenus from "./partners/planetarium-wenus.png";
import uniwersytetZielonogorski from "./partners/uniwersytet-zielonogorski.jpg";
import wampirowoSvg from "./partners/wampirowo.svg";
import zagrajmySvg from "./partners/zagrajmy.svg";
import zok from "./partners/zok.jpg";

/** Next types `*.svg` as `any` so `@svgr/webpack` can redefine it; these ones are images. */
// oxlint-disable-next-line typescript/no-unsafe-type-assertion
const asImage = (svg: unknown) => svg as StaticImageData;

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
  /** A mark is somebody's front door — unless they haven't got one yet. */
  href?: string;
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
      {
        name: "Fundacja Per Aspera",
        src: asImage(perAsperaSvg),
      },
    ],
  },
  {
    tier: "Mecenasi",
    logos: [
      {
        name: "Wampirowo.pl",
        src: asImage(wampirowoSvg),
        href: "https://wampirowo.pl/",
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
        src: asImage(zagrajmySvg),
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
      {
        name: "Otwarte Komiksy",
        src: otwarteKomiksy,
        href: "https://www.youtube.com/@OtwarteKomiksy",
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
