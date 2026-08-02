import { NextResponse } from "next/server";

import { EMPTY_CART, fetchCart, fetchCheckoutUrl } from "@/components/Cart/cart";

/** One buyer's cart, keyed to a session cookie. Never cached, never shared. */
export const dynamic = "force-dynamic";

/**
 * What the header trigger and the cart sheet read after mount. A visitor with
 * no session costs WordPress nothing — `fetchCart` answers from the missing
 * cookie — and `checkoutUrl` is only worth a request once the cart has
 * something in it.
 */
export async function GET() {
  const result = await fetchCart();
  const cart = result.ok ? result.data : EMPTY_CART;
  const checkoutUrl = cart.isEmpty ? undefined : await fetchCheckoutUrl();

  return NextResponse.json({ cart, checkoutUrl }, { headers: { "cache-control": "no-store" } });
}
