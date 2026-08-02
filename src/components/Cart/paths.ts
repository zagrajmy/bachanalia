/**
 * The headless flow lives under `/sklep/`, clear of `/koszyk/` and
 * `/zamowienie/` — those are WooCommerce's own paths and stay pointed at
 * WordPress until cutover.
 */
export const CART_PATH = "/sklep/koszyk/";
export const CHECKOUT_PATH = "/sklep/kasa/";
export const CONFIRMATION_PATH = "/sklep/kasa/potwierdzenie/";
