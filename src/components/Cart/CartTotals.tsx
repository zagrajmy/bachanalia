import type { CartView } from "./types";

/**
 * Every figure here is WooCommerce's own formatted string. Nothing in this
 * component adds, multiplies or rounds anything.
 */
export function CartTotals({
  cart,
  className = "",
}: {
  cart: CartView;
  className?: string;
}) {
  return (
    <dl
      className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-8 text-sm ${className}`}
    >
      <dt className="text-ink-muted">Wartość produktów</dt>
      <dd className="text-right tabular-nums">{cart.subtotal}</dd>

      {cart.discountTotal && cart.discountTotal !== "0 zł" && (
        <>
          <dt className="text-ink-muted">Rabat</dt>
          <dd className="text-right tabular-nums">−{cart.discountTotal}</dd>
        </>
      )}

      <dt className="text-ink-muted">Dostawa</dt>
      <dd className="text-right tabular-nums">{cart.shippingTotal}</dd>

      <dt className="display col-start-1 pt-2 text-lg">Razem</dt>
      <dd className="display pt-2 text-right text-lg tabular-nums">
        {cart.total}
      </dd>
    </dl>
  );
}
