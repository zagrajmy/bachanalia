export const SHOP_PATH = "/sklep/";

/**
 * WooCommerce's own permalink, kept so every indexed product URL keeps
 * working without a redirect. The generic /index.php rule covers the legacy
 * PATHINFO form.
 */
export const productPath = (slug: string) => `/produkt/${slug}/`;

/**
 * The dorm beds are a WooCommerce product whose slug names the edition, so the
 * nav cannot point at one and stay right. This path can: the route behind it
 * reads the catalogue and sends the reader to the one bed on sale, or to the
 * shop when there are several of them, or none yet.
 */
export const NOCLEGI_PATH = "/noclegi/";

/**
 * Published in WordPress, not part of this site: a 2023 stub, a probe for the
 * Facebook feed, and WordPress's own duplicate of the exhibitor rules. The
 * catch-all would otherwise render all three.
 *
 * The four WooCommerce pages are here for a different reason — they are live
 * and stay on WordPress until cutover, so the catch-all would prerender their
 * bodies as empty shortcode shells standing beside the real cart.
 */
export const RETIRED_PATHS = [
  "/feed-test/",
  "/info/",
  "/poznaj-wystawcow/",
  "/regulamin-wystawcow-2/",
  "/zgloszenia-wystawcow/",
  "/koszyk/",
  "/zamowienie/",
  "/moje-konto/",
  "/zwroty/",
];

/**
 * Published in WordPress and served here too, from our own route. The catch-all
 * must not prerender WordPress's copy behind the page that already answers the
 * path — unlike RETIRED_PATHS these are not 404s, they are ours.
 */
export const SHADOWED_PATHS = ["/regulamin-wystawcow/", NOCLEGI_PATH];

export type NavLink = { external?: boolean; href: string; label: string };

/**
 * A group's `href` is a real destination, not a toggle. The WordPress menu
 * hung its top level on dead `#` anchors, so keyboard and touch users got a
 * parent that went nowhere.
 */
export type NavGroup = NavLink & { children?: NavLink[] };

export const primaryNav: NavGroup[] = [
  {
    href: "/co-to-sa-bachanalia/",
    label: "Info",
    children: [
      { href: "/co-to-sa-bachanalia/", label: "Co to są Bachanalia" },
      { href: "/aktualnosci/", label: "Aktualności" },
      { href: "/czas-i-miejsce/", label: "Czas i miejsce" },
      { href: "/organizator/", label: "Organizator" },
      { href: "/sztab-bachanaliowy/", label: "Sztab bachanaliowy" },
      { href: "/regulamin/", label: "Regulamin" },
    ],
  },
  {
    href: "/program/",
    label: "Program",
    children: [
      { href: "/blok-prelekcyjny/", label: "Blok prelekcyjny" },
      { href: "/blok-konkursowy/", label: "Blok konkursowy" },
      { href: "/blok-naukowy/", label: "Blok naukowy" },
      { href: "/blok-komiksowy/", label: "Blok komiksowy" },
      { href: "/rpg/", label: "RPG" },
      { href: "/gamesroom/", label: "Gamesroom" },
      { href: "/retro-gaming/", label: "Retro gaming" },
      { href: "/cosplay/", label: "Cosplay" },
      { href: "/goscie/", label: "Goście" },
    ],
  },
  { href: "/wystawcy/", label: "Wystawcy" },
  {
    href: "/zgloszenia-programu/",
    label: "Dołącz do nas",
    children: [
      { href: "/zgloszenia-programu/", label: "Zgłoszenia programu" },
      { href: "/zgloszenia-obslugi/", label: "Zgłoszenia obsługi" },
    ],
  },
  { href: "/wspieraja-nas/", label: "Wspierają nas" },
  { href: NOCLEGI_PATH, label: "Noclegi" },
  { href: SHOP_PATH, label: "Sklep" },
];

/**
 * Straight to the shop. The WordPress /akredytacja/ page only ever explained
 * that the shop sells them, and the Taryfikator now carries the prices.
 */
export const primaryCta = { href: SHOP_PATH, label: "Akredytacja" };

export const footerNav = [
  {
    title: "Informacje",
    links: [
      { href: "/aktualnosci/", label: "Aktualności" },
      { href: "/co-to-sa-bachanalia/", label: "Co to są Bachanalia" },
      { href: "/organizator/", label: "Organizator" },
      { href: "/sztab-bachanaliowy/", label: "Sztab bachanaliowy" },
      { href: "/czas-i-miejsce/", label: "Czas i miejsce" },
      { href: "/regulamin/", label: "Regulamin" },
    ],
  },
  {
    title: "Program",
    links: [
      { href: "/blok-prelekcyjny/", label: "Blok prelekcyjny" },
      { href: "/blok-konkursowy/", label: "Blok konkursowy" },
      { href: "/blok-naukowy/", label: "Blok naukowy" },
      { href: "/blok-komiksowy/", label: "Blok komiksowy" },
      { href: "/rpg/", label: "RPG" },
      { href: "/gamesroom/", label: "Gamesroom" },
      { href: "/retro-gaming/", label: "Retro gaming" },
      { href: "/cosplay/", label: "Cosplay" },
    ],
  },
  {
    title: "Dołącz do nas",
    links: [
      { href: "/zgloszenia-programu/", label: "Zgłoszenia programu" },
      { href: "/zgloszenia-obslugi/", label: "Zgłoszenia obsługi" },
    ],
  },
  {
    title: "Wystawcy i wsparcie",
    links: [
      { href: "/wystawcy/", label: "Wystawcy" },
      { href: "/regulamin-wystawcow/", label: "Regulamin wystawców" },
      { href: "/wspieraja-nas/", label: "Wspierają nas" },
      { href: NOCLEGI_PATH, label: "Noclegi" },
      { href: SHOP_PATH, label: "Sklep" },
    ],
  },
];
