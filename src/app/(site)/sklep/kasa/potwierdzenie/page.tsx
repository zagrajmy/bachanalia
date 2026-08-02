import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { orderPayUrl } from "@/components/Cart/cart";
import { readOrder } from "@/components/Cart/order";
import { SHOP_PATH } from "@/components/Globals/siteNav";
import { Button } from "@/components/ui/warcraftcn/button";

export const metadata: Metadata = {
  title: "Zamówienie przyjęte",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_LABELS: { [status: string]: string } = {
  PENDING: "Oczekuje na płatność",
  ON_HOLD: "Czeka na wpłatę",
  PROCESSING: "W realizacji",
  COMPLETED: "Zrealizowane",
  CANCELLED: "Anulowane",
  FAILED: "Nieudane",
  REFUNDED: "Zwrócone",
};

export default async function PotwierdzeniePage() {
  const order = await readOrder();

  if (!order) redirect(SHOP_PATH);

  return (
    <div className="gutter mx-auto max-w-2xl pt-10 pb-20 sm:pt-14">
      <p className="eyebrow text-rose">Zamówienie przyjęte</p>

      <h1 className="display mt-2 -ml-[0.04em] text-[clamp(2.1rem,6.4vw,3.4rem)]">
        Numer {order.orderNumber}
      </h1>

      <dl className="mt-8 grid grid-cols-[minmax(0,1fr)_auto] gap-x-8 gap-y-3 border-t-2 border-navy pt-5">
        <dt className="text-ink-muted">Do zapłaty</dt>
        <dd className="display text-right tabular-nums">{order.total}</dd>

        <dt className="text-ink-muted">Płatność</dt>
        <dd className="text-right">{order.paymentMethodTitle}</dd>

        <dt className="text-ink-muted">Status</dt>
        <dd className="text-right">{STATUS_LABELS[order.status] ?? order.status}</dd>
      </dl>

      {order.needsPayment && order.orderKey && (
        <Button asChild className="mt-9 px-8 py-3.5">
          <a href={orderPayUrl(order)}>Opłać zamówienie</a>
        </Button>
      )}

      <p className="mt-10">
        <Link
          href={SHOP_PATH}
          className="eyebrow text-ink-muted no-underline underline-offset-[0.25em] hover:text-rose hover:underline"
        >
          ← Sklep
        </Link>
      </p>
    </div>
  );
}
