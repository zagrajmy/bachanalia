/**
 * The headless flow lives under `/sklep/`, clear of `/koszyk/` and
 * `/zamowienie/` — those are WooCommerce's own paths and stay pointed at
 * WordPress until cutover.
 */
export const CART_PATH = "/sklep/koszyk/";

/**
 * Shown when WooGraphQL will not hand over a checkout URL — the transfer
 * setting is off, or the shop is unreachable. The buyer is holding money at
 * this point, so the message carries the address instead of telling them to
 * write to nobody in particular.
 */
export const CHECKOUT_UNAVAILABLE =
  "Płatności są chwilowo niedostępne. Napisz na org@bachanaliafantastyczne.pl, dokończymy zamówienie.";
