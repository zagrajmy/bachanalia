export const SHOP_URL = "https://bachanaliafantastyczne.pl/index.php/sklep/";

export type NavLink = { href: string; label: string; external?: boolean };

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
  { href: SHOP_URL, label: "Sklep", external: true },
];

export const primaryCta = { href: "/akredytacja/", label: "Akredytacja" };

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
      { href: SHOP_URL, label: "Sklep", external: true },
    ],
  },
];
