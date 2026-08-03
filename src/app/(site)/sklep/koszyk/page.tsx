import type { Metadata } from "next";
import Link from "next/link";

import { CartLines } from "@/components/Cart/CartLines";
import { CartTotals } from "@/components/Cart/CartTotals";
import { fetchCart, fetchCheckoutUrl } from "@/components/Cart/cart";
import { CART_PATH, CHECKOUT_UNAVAILABLE } from "@/components/Cart/paths";
import { SHOP_PATH } from "@/components/Globals/siteNav";
import { Button } from "@/components/ui/warcraftcn/button";

export const metadata: Metadata = {
  title: "Koszyk",
  robots: { index: false, follow: false },
};

/**
 * The cart is one buyer's, keyed to a session cookie. Nothing about it may be
 * cached, tagged or prerendered the way the content routes are.
 */
export const dynamic = "force-dynamic";

export default async function KoszykPage() {
  const [result, checkoutUrl] = await Promise.all([fetchCart(), fetchCheckoutUrl()]);

  /**
   * A cart WooCommerce would not hand over is not an empty cart. Saying so
   * would invite the buyer to add everything a second time.
   */
  if (!result.ok) {
    return (
      <div className="gutter mx-auto max-w-4xl pt-10 pb-20 sm:pt-14">
        <h1 className="display -ml-[0.04em] text-[clamp(2.1rem,6.4vw,3.4rem)]">Koszyk</h1>

        <p className="mt-8 rounded-card border border-rose px-4 py-3 text-rose">{result.message}</p>

        <p className="mt-6">
          <a className="underline underline-offset-[0.25em]" href={CART_PATH}>
            Odśwież koszyk
          </a>
        </p>
      </div>
    );
  }

  const cart = result.data;

  return (
    <div className="gutter mx-auto max-w-4xl pt-10 pb-20 sm:pt-14">
      <Link
        href={SHOP_PATH}
        className="eyebrow text-ink-muted no-underline underline-offset-[0.25em] hover:text-rose hover:underline"
      >
        ← Sklep
      </Link>

      <h1 className="display mt-6 -ml-[0.04em] text-[clamp(2.1rem,6.4vw,3.4rem)]">Koszyk</h1>

      {cart.isEmpty ? (
        <div className="mt-10 border-t-2 border-navy pt-8">
          <p className="text-lg text-ink-muted">Koszyk jest pusty.</p>

          <Button asChild className="mt-6 px-8 py-3.5">
            <Link href={SHOP_PATH}>Wybierz akredytację</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <CartLines lines={cart.lines} />
          </div>

          <CartTotals cart={cart} className="mt-8 ml-auto max-w-sm" />

          <div className="mt-8 flex flex-col items-end gap-3">
            {checkoutUrl ? (
              <Button asChild className="px-8 py-3.5 text-[clamp(0.85rem,2.2vw,1rem)]">
                <a href={checkoutUrl}>Przejdź do płatności</a>
              </Button>
            ) : (
              <p className="text-sm text-rose">{CHECKOUT_UNAVAILABLE}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
