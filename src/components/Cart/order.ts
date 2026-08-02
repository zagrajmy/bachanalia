import { cookies } from "next/headers";

import type { CheckoutOrder } from "./cart";

/**
 * The order the confirmation page prints, handed over in an httpOnly cookie
 * rather than the URL. WooCommerce's own thank-you links carry the order key
 * as a query parameter; there is no reason to copy that here when the same
 * server wrote and reads it one navigation apart.
 */
export const ORDER_COOKIE = "bf_wc_order";

export const ORDER_COOKIE_MAX_AGE = 60 * 60;

export async function readOrder(): Promise<CheckoutOrder | undefined> {
  const raw = (await cookies()).get(ORDER_COOKIE)?.value;

  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as CheckoutOrder;
  } catch {
    return undefined;
  }
}
