import type { StaticImageData } from "next/image";

import ambasadaSzwajcarii from "./partners/ambasada-szwajcarii.webp";
import dylanDog from "./partners/dylan-dog.webp";
import fahrenheit from "./partners/fahrenheit.webp";
import instytutKulturyWloskiej from "./partners/instytut-kultury-wloskiej.webp";
import iuvi from "./partners/iuvi.webp";
import komiksopedia from "./partners/komiksopedia.webp";
import komiksowyPamietnikSvg from "./partners/komiksowy-pamietnik.svg";
import konwentyPoludniowe from "./partners/konwenty-poludniowe.webp";
import krzychuAndBuk from "./partners/krzychu-and-buk.webp";
import letra from "./partners/letra.webp";
import lubuskieSvg from "./partners/lubuskie.svg";
import miastoZielonaGora from "./partners/miasto-zielona-gora.webp";
import muduko from "./partners/muduko.webp";
import naszaKsiegarnia from "./partners/nasza-ksiegarnia.webp";
import otwarteKomiksy from "./partners/otwarte-komiksy.webp";
import perAsperaSvg from "./partners/per-aspera.svg";
import planetariumWenus from "./partners/planetarium-wenus.webp";
import powergraph from "./partners/powergraph.webp";
import raszczakpl from "./partners/raszczakpl.webp";
import rebis from "./partners/rebis.webp";
import retroKomiks from "./partners/retro-komiks.webp";
import timof from "./partners/timof.webp";
import tore from "./partners/tore.webp";
import toyotaZielonaGora from "./partners/toyota-zielona-gora.svg";
import uniwersytetZielonogorski from "./partners/uniwersytet-zielonogorski.webp";
import wampirowoSvg from "./partners/wampirowo.svg";
import zagrajmySvg from "./partners/zagrajmy.svg";
import znakiemTego from "./partners/znakiem-tego.webp";
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
  /** A nudge on top of the height ladder, for a mark that still sits wrong. */
  scale?: number;
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
    tier: "Patroni honorowi",
    logos: [
      {
        name: "Ambasada Szwajcarii w Polsce",
        narrow: true,
        scale: 1.15,
        src: ambasadaSzwajcarii,
        href: "https://www.eda.admin.ch/warsaw",
        whiteBox: true,
      },
      {
        name: "Instytut Kultury Włoskiej w Warszawie",
        narrow: true,
        scale: 1.15,
        src: instytutKulturyWloskiej,
        href: "https://iicvarsavia.esteri.it/pl/",
        whiteBox: true,
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
        name: "Dylan Dog",
        src: dylanDog,
        href: "https://www.instagram.com/dylandogpl",
      },
      {
        name: "Toyota Zielona Góra",
        scale: 1.15,
        src: asImage(toyotaZielonaGora),
        href: "https://www.toyota-zg.pl/",
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
        name: "IUVI Games",
        src: iuvi,
        href: "https://iuvigames.pl/",
      },
      {
        name: "Wydawnictwo Nasza Księgarnia",
        narrow: true,
        src: naszaKsiegarnia,
        href: "https://nk.com.pl/",
      },
      {
        name: "Muduko",
        src: muduko,
        href: "https://muduko.com/",
        whiteBox: true,
      },
    ],
  },
  {
    tier: "Patroni medialni",
    logos: [
      {
        name: "Fahrenheit",
        narrow: true,
        src: fahrenheit,
        href: "https://fahrenheit.net.pl/",
      },
      {
        name: "Konwenty Południowe",
        narrow: true,
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
      {
        name: "RaszczakPL",
        src: raszczakpl,
        href: "https://www.instagram.com/raszczakpl",
      },
      {
        name: "Retro Komiks",
        src: retroKomiks,
        href: "https://retroopowiesci.blogspot.com/",
        whiteBox: true,
      },
      {
        name: "Znakiem Tego",
        src: znakiemTego,
        href: "https://www.instagram.com/znakiem_tego",
      },
      {
        name: "Timof Comics",
        src: timof,
        href: "https://timof.pl/",
        whiteBox: true,
      },
      {
        name: "krzychu_and_buk",
        src: krzychuAndBuk,
        href: "https://www.instagram.com/krzychu_and_buk",
      },
      {
        name: "komiksopedia.pl",
        src: komiksopedia,
        href: "https://komiksopedia.pl/",
      },
      {
        name: "Komiksowy Pamiętnik",
        src: asImage(komiksowyPamietnikSvg),
        href: "https://www.instagram.com/komiksowy_pamietnik",
      },
    ],
  },
];

/**
 * Who paid for it. Public money answers to different rules than sponsorship,
 * so they sit in a strip of their own below the tiers rather than in the
 * grid — and the mark is the whole entry, with no room to go unlinked.
 */
export const FUNDING: (Pick<PartnerLogo, "name" | "src" | "whiteBox"> & { href: string })[] = [
  {
    name: "Zrealizowano przy pomocy finansowej Miasta Zielona Góra",
    src: miastoZielonaGora,
    href: "https://zielona-gora.pl/",
  },
  {
    name: "Lubuskie. Warte zachodu",
    src: asImage(lubuskieSvg),
    href: "https://lubuskie.pl/",
  },
];
