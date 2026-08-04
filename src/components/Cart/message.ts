import { htmlToText } from "@/utils/wpHtml";

/**
 * WooCommerce's error strings are HTML, not text. It writes them for its own
 * templates, so they arrive with entities and, on the stock-limit errors, a
 * button appended:
 *
 *     Nie możesz dodać kolejnej sztuki &bdquo;Wsparcie Klubu 1 zł&rdquo; do
 *     koszyka. <a href="…/index.php/koszyk/" class="button wc-forward">Zobacz
 *     koszyk</a>
 *
 * Rendered raw, a buyer reads the markup.
 */

/**
 * That call to action goes to WordPress's own cart, which shares no session
 * with this one and would show an empty basket. It is dropped rather than
 * translated: the sentence before it is the fact, and our sheet is the cart.
 */
const TRAILING_LINK = /(?:\s|&nbsp;|<br\s*\/?>)*<a\b[^>]*>[\s\S]*?<\/a>\s*$/i;

/**
 * WooCommerce answers an empty cart at checkout with its session error, which
 * says nothing a buyer can act on. Everything else is passed through as it
 * came — most of these are still English, and seeing the real ones while the
 * cart is this new is worth more than a generic sentence hiding them.
 */
const TRANSLATIONS: Record<string, string> = {
  "Sorry, no session found.": "Koszyk jest pusty.",
  "Invalid payment method.": "Ta metoda płatności jest niedostępna.",
};

export function wooMessage(raw: string) {
  let html = raw;

  while (TRAILING_LINK.test(html)) html = html.replace(TRAILING_LINK, "");

  const text = htmlToText(html);

  return TRANSLATIONS[text] ?? text;
}
