import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { fetchCart, fetchPaymentGateways } from "@/components/Cart/cart";
import { CheckoutForm } from "@/components/Cart/CheckoutForm";
import { CART_PATH } from "@/components/Cart/paths";
import { WP_CART_URL } from "@/components/Globals/siteNav";

export const metadata: Metadata = {
  title: "Zamówienie",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function KasaPage() {
  const result = await fetchCart();

  /** An unreadable cart is not an order anyone should be filling a form for. */
  if (!result.ok || result.data.isEmpty) redirect(CART_PATH);

  const cart = result.data;

  const gateways = await fetchPaymentGateways();

  return (
    <div className="gutter mx-auto max-w-3xl pt-10 pb-20 sm:pt-14">
      <Link
        href={CART_PATH}
        className="eyebrow text-ink-muted no-underline underline-offset-[0.25em] hover:text-rose hover:underline"
      >
        ← Koszyk
      </Link>

      <h1 className="display mt-6 -ml-[0.04em] text-[clamp(2.1rem,6.4vw,3.4rem)]">Zamówienie</h1>

      <ul className="mt-8 border-t-2 border-navy">
        {cart.lines.map((line) => (
          <li
            key={line.key}
            className="flex items-baseline justify-between gap-6 border-b border-dashed border-hairline py-3"
          >
            <span className="min-w-0">
              {line.name}
              {line.options.map((option) => (
                <span key={option.label} className="block text-sm text-ink-muted">
                  {option.label}: {option.value}
                </span>
              ))}
            </span>
            <span className="shrink-0 text-sm text-ink-muted tabular-nums">× {line.quantity}</span>
            <span className="display shrink-0 tabular-nums">{line.total}</span>
          </li>
        ))}
      </ul>

      {gateways.length === 0 ? (
        <div className="mt-10 rounded-card border border-rose p-5">
          <p className="text-rose">
            Sklep nie udostępnia teraz żadnej metody płatności, której możemy tu użyć.
          </p>
          <p className="mt-3">
            <a className="underline underline-offset-[0.25em]" href={WP_CART_URL}>
              Dokończ zakup w sklepie WooCommerce
            </a>
          </p>
        </div>
      ) : (
        <CheckoutForm
          gateways={gateways}
          shippingRates={cart.shippingRates}
          chosenShippingMethod={cart.chosenShippingMethods[0]}
          total={cart.total}
        />
      )}
    </div>
  );
}
