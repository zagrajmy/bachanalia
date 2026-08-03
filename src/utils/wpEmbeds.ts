import { buttonVariants } from "@/components/ui/warcraftcn/button";

/**
 * Third-party iframes never reach a browser with their `src` intact.
 *
 * Editors drop Google Maps, Google Forms and Miro boards into WordPress pages,
 * and each one is a request to a company the visitor did not choose, made
 * before they can say anything about it. The old site's CookieYes showed a
 * banner and left every `src` alone, which is the failure mode this exists to
 * avoid: the URL is parked in a data attribute, and only the recorded answer
 * puts it back.
 *
 * Rendered as static HTML rather than a React component because the page body
 * arrives as one `dangerouslySetInnerHTML` blob. `Consent` picks these up by
 * their data attributes.
 */

/** Anything not served from here is somebody else's server. */
const OURS = [process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME, "bachanaliafantastyczne.pl"].filter(
  Boolean,
);

const IFRAME = /<iframe\b([^>]*)>(?:[\s\S]*?<\/iframe>)?/gi;

const attribute = (tag: string, name: string) =>
  new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1];

/**
 * What is missing from the page, so the notice is not "Tu jest treść". `it`
 * carries the gender, because a sentence that has to dodge the pronoun to stay
 * grammatical reads like it was written by a machine.
 */
const KINDS: { host: RegExp; it: string; noun: string }[] = [
  { host: /(^|\.)google\.[a-z.]+$/, noun: "mapa Google", it: "ją" },
  { host: /(^|\.)miro\.com$/, noun: "tablica Miro", it: "ją" },
  { host: /(^|\.)(youtube\.com|youtu\.be)$/, noun: "film z YouTube", it: "go" },
];

const FORMS = /docs\.google\.com\/forms/;

function describe(url: URL) {
  if (FORMS.test(url.host + url.pathname)) return { noun: "formularz Google", it: "go" };

  for (const kind of KINDS) if (kind.host.test(url.host)) return kind;

  return { noun: `treść z ${url.host}`, it: "ją" };
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

/**
 * The site's own button, reached through `cva` rather than the component,
 * because this is a string of HTML and not a tree of elements. Hand-rolling
 * one here is how a second button style gets into the design system.
 *
 * It answers for the whole site, not for this one embed — `Consent` treats it
 * as the banner's "Okej", so there is still a single question with a single
 * answer, just reachable from the place where the absence is noticed.
 */
const BUTTON = `${buttonVariants()} px-6 py-2.5 text-sm`;

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

    const { noun, it } = describe(url);
    const title = attribute(attrs, "title");

    return [
      /**
       * No frame. A dashed rule is the perforation between sections here, not
       * something drawn around a picture — the tint alone marks the slot.
       */
      `<div class="wp-embed my-8 flex w-full flex-col items-center justify-center gap-3 rounded-card bg-paper-shade px-6 py-12 text-center"`,
      ` data-embed-src="${forAttribute(src)}"`,
      title ? ` data-embed-title="${forAttribute(title)}"` : "",
      `><p class="max-w-[42ch] text-sm text-ink-muted">Tu jest ${noun}. Pokażemy ${it}, kiedy zgodzisz się na treści z <strong class="font-semibold text-ink">${url.host}</strong>.</p>`,
      `<button type="button" data-embed-accept class="${BUTTON}">Zaakceptuj ciastka</button>`,
      `<a class="${LINK}" href="${forAttribute(src)}" rel="noreferrer" target="_blank">Otwórz w nowej karcie</a>`,
      `</div>`,
    ].join("");
  });
