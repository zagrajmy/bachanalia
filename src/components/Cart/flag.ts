/**
 * `NEXT_PUBLIC_HEADLESS_CART=1` links the headless flow from the product page.
 * Unset, it is on in `next dev` and off everywhere else, so the live "Kup w
 * sklepie" hand-off to WooCommerce is the only buy path in production while
 * the routes stay reachable for testing by URL.
 */
const flag = process.env.NEXT_PUBLIC_HEADLESS_CART;

export const headlessCartLinked =
  flag === undefined || flag === "" ? process.env.NODE_ENV === "development" : flag === "1";
