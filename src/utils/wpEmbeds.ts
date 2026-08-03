/**
 * Third-party iframes never reach a browser with their `src` intact.
 *
 * Editors drop Google Maps, Google Forms and Miro boards into WordPress pages,
 * and each one is a request to a company the visitor did not choose, made
 * before they can say anything about it. The old site's CookieYes showed a
 * banner and left every `src` alone, which is the failure mode this exists to
 * avoid: the URL is parked in a data attribute, and only a click or a
 * recorded choice puts it back.
 *
 * Rendered as static HTML rather than a React component because the page body
 * arrives as one `dangerouslySetInnerHTML` blob. `EmbedConsent` picks these up
 * by their data attributes.
 */

/** Anything not served from here is somebody else's server. */
const OURS = [process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME, "bachanaliafantastyczne.pl"].filter(
  Boolean,
);

const IFRAME = /<iframe\b([^>]*)>(?:[\s\S]*?<\/iframe>)?/gi;

const attribute = (tag: string, name: string) =>
  new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1];

/** What the visitor is being asked to load, so the button is not "Pokaż treść". */
const KINDS: { host: RegExp; noun: string; verb: string }[] = [
  { host: /(^|\.)google\.[a-z.]+$/, noun: "mapa Google", verb: "Pokaż mapę" },
  { host: /(^|\.)miro\.com$/, noun: "tablica Miro", verb: "Pokaż tablicę" },
  { host: /(^|\.)(youtube\.com|youtu\.be)$/, noun: "film z YouTube", verb: "Odtwórz film" },
];

const FORMS = /docs\.google\.com\/forms/;

function describe(url: URL) {
  if (FORMS.test(url.host + url.pathname))
    return { noun: "formularz Google", verb: "Pokaż formularz" };

  for (const kind of KINDS) if (kind.host.test(url.host)) return kind;

  return { noun: `treść z ${url.host}`, verb: "Pokaż" };
}

function isOurs(host: string) {
  return OURS.some((ours) => host === ours || host.endsWith(`.${ours}`));
}

/**
 * WordPress hands these over entity-encoded (`&#038;` for every `&`), and they
 * go straight back into an attribute, so the browser decodes them once on the
 * way out. A quote would end the attribute early, and no legitimate embed URL
 * carries one.
 */
const forAttribute = (value: string) => value.replaceAll('"', "");

const BUTTON =
  "cursor-pointer rounded-full border-2 border-navy bg-accent px-5 py-2 text-sm font-semibold text-on-accent transition-transform duration-150 ease-out hover:-translate-y-px active:scale-[0.97]";

const LINK = "text-sm text-ink-muted underline-offset-[0.25em] decoration-dashed hover:underline";

export const blockThirdPartyEmbeds = (html: string) =>
  html.replaceAll(IFRAME, (raw, attrs: string) => {
    const src = attribute(attrs, "src");
    if (!src) return raw;

    let url: URL;

    try {
      url = new URL(src.replaceAll("&#038;", "&").replaceAll("&amp;", "&"));
    } catch {
      /** A relative or malformed src reaches nobody new. */
      return raw;
    }

    if (isOurs(url.host)) return raw;

    const { noun, verb } = describe(url);
    const title = attribute(attrs, "title");

    return [
      `<div class="wp-embed not-prose my-8 flex w-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-hairline bg-paper-shade/60 px-6 py-10 text-center"`,
      ` data-embed-src="${forAttribute(src)}"`,
      title ? ` data-embed-title="${forAttribute(title)}"` : "",
      `><p class="max-w-[42ch] text-sm text-ink-muted">Tu jest ${noun}. Wczytanie tej treści połączy Twoją przeglądarkę z <strong class="font-semibold text-ink">${url.host}</strong>.</p>`,
      `<button type="button" data-embed-load class="${BUTTON}">${verb}</button>`,
      `<a class="${LINK}" href="${forAttribute(src)}" rel="noreferrer" target="_blank">Otwórz w nowej karcie</a>`,
      `</div>`,
    ].join("");
  });
