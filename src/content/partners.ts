import type { StaticImageData } from "next/image";

import ambasadaSzwajcarii from "./partners/ambasada-szwajcarii.webp";
import dylanDog from "./partners/dylan-dog.webp";
import fahrenheit from "./partners/fahrenheit.webp";
import instytutKulturyWloskiej from "./partners/instytut-kultury-wloskiej.webp";
import konwentyPoludniowe from "./partners/konwenty-poludniowe.webp";
import letra from "./partners/letra.webp";
import miastoZielonaGora from "./partners/miasto-zielona-gora.webp";
import otwarteKomiksy from "./partners/otwarte-komiksy.webp";
import perAsperaSvg from "./partners/per-aspera.svg";
import planetariumWenus from "./partners/planetarium-wenus.webp";
import powergraph from "./partners/powergraph.webp";
import rebis from "./partners/rebis.webp";
import tore from "./partners/tore.webp";
import uniwersytetZielonogorski from "./partners/uniwersytet-zielonogorski.webp";
import wampirowoSvg from "./partners/wampirowo.svg";
import zagrajmySvg from "./partners/zagrajmy.svg";
import zok from "./partners/zok.webp";

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
        narrow: true,
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
      {
        name: "Wydawnictwo Powergraph",
        src: powergraph,
        href: "https://powergraph.pl/",
        whiteBox: true,
      },
      {
        name: "Dom Wydawniczy Rebis",
        src: rebis,
        href: "https://rebis.com.pl/",
        whiteBox: true,
      },
      {
        name: "Oficyna Wydawnicza Tore",
        src: tore,
        href: "http://www.toreoficyna.pl/",
      },
      {
        name: "Dylan Dog. 40 lat koszmarów",
        src: dylanDog,
        href: "https://www.youtube.com/@dylandogpl",
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
      {
        name: "Ambasada Szwajcarii w Polsce",
        narrow: true,
        src: ambasadaSzwajcarii,
        href: "https://www.eda.admin.ch/warsaw",
        whiteBox: true,
      },
      {
        name: "Instytut Kultury Włoskiej w Warszawie",
        narrow: true,
        src: instytutKulturyWloskiej,
        href: "https://iicvarsavia.esteri.it/pl/",
        whiteBox: true,
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
        name: "Letra",
        src: letra,
        href: "https://arkady.eu/",
        whiteBox: true,
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
