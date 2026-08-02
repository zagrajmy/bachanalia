/**
 * Who is listed on /wspieraja-nas/ stays in WordPress. Only the wording is
 * ours, because the markup names nobody: alt text is empty on five of the
 * seven logos and the upload's filename on the rest, and filenames lie here —
 * `2026/07/kepler.png` is the Planetarium Wenus mark.
 *
 * The link is the one thing an editor always gets right, so names are keyed by
 * destination. Adding a partner in WordPress is enough to list it; adding a
 * line here only makes the credit read properly.
 */
const NAMES: Record<string, { name: string; note?: string }> = {
  "centrumnaukikeplera.pl": { name: "Planetarium Wenus" },
  "fahrenheit.net.pl": { name: "Fahrenheit" },
  "konwenty-poludniowe.pl": { name: "Konwenty Południowe" },
  "uz.zgora.pl": { name: "Uniwersytet Zielonogórski" },
  "youtube.com/@otwartekomiksy": { name: "Otwarte Komiksy" },
  "zielona-gora.pl": {
    name: "Miasto Zielona Góra",
    /** The mark carries this sentence inside the artwork; the strip repeats it as text. */
    note: "Zrealizowano przy pomocy finansowej Miasta Zielona Góra",
  },
  "zagrajmy.net": { name: "Zagrajmy.net" },
  "zok.com.pl": { name: "Zielonogórski Ośrodek Kultury" },
};

/** `https://www.zok.com.pl/foo/` → `zok.com.pl/foo`, the shape the keys use. */
function normalise(href: string) {
  return href
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "");
}

/**
 * Longest match wins, so a whole host can be named while one channel on a
 * shared host — a YouTube handle — still gets its own entry.
 */
export function partnerCredit(href?: string, alt?: string) {
  if (href) {
    const parts = normalise(href).split("/");

    for (let end = parts.length; end > 0; end--) {
      const credit = NAMES[parts.slice(0, end).join("/")];
      if (credit) return credit;
    }

    /** An unlisted partner still reads as something; the host is the honest guess. */
    return { name: usableAlt(alt) ?? parts[0] };
  }

  return { name: usableAlt(alt) ?? "" };
}

/** Elementor defaults alt text to the upload's filename, which is not a name. */
function usableAlt(alt?: string) {
  const text = alt?.trim();
  return text && text.includes(" ") && !/\d{5}/.test(text) ? text : undefined;
}
