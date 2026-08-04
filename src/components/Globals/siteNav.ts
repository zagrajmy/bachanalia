export const SHOP_PATH = "/sklep/";

/**
 * WooCommerce's own permalink, kept so every indexed product URL keeps
 * working without a redirect. The generic /index.php rule covers the legacy
 * PATHINFO form.
 */
export const productPath = (slug: string) => `/produkt/${slug}/`;

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
  "/regulamin-wystawcow-2/",
  "/koszyk/",
  "/zamowienie/",
  "/moje-konto/",
  "/zwroty/",
];

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
  {
    href: "/poznaj-wystawcow/",
    label: "Wystawcy",
    children: [
      { href: "/poznaj-wystawcow/", label: "Poznaj wystawców" },
      { href: "/regulamin-wystawcow/", label: "Regulamin wystawców" },
      { href: "/zgloszenia-wystawcow/", label: "Zgłoszenia wystawców" },
    ],
  },
  {
    href: "/zgloszenia-programu/",
    label: "Dołącz do nas",
    children: [
      { href: "/zgloszenia-programu/", label: "Zgłoszenia programu" },
      { href: "/zgloszenia-obslugi/", label: "Zgłoszenia obsługi" },
    ],
  },
  { href: "/wspieraja-nas/", label: "Wspierają nas" },
  { href: "/noclegi/", label: "Noclegi" },
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
      { href: "/zgloszenia-wystawcow/", label: "Zgłoszenia wystawców" },
    ],
  },
  {
    title: "Wystawcy i wsparcie",
    links: [
      { href: "/poznaj-wystawcow/", label: "Poznaj wystawców" },
      { href: "/regulamin-wystawcow/", label: "Regulamin wystawców" },
      { href: "/wspieraja-nas/", label: "Wspierają nas" },
      { href: "/noclegi/", label: "Noclegi" },
      { href: SHOP_PATH, label: "Sklep" },
    ],
  },
];
