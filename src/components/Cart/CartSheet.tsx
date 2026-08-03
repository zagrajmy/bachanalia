"use client";

import Link from "next/link";
import { useEffect } from "react";
import ShoppingBag01Icon from "@hugeicons/core-free-icons/ShoppingBag01Icon";
import { HugeiconsIcon } from "@hugeicons/react";

import { SHOP_PATH } from "@/components/Globals/siteNav";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/warcraftcn/button";

import { CartLines } from "./CartLines";
import { CartTotals } from "./CartTotals";
import { CHECKOUT_UNAVAILABLE } from "./paths";
import { loadCart, setCartOpen, useCart } from "./store";

/** 1 produkt, 2–4 produkty, 5+ produktów, and 12–14 back to produktów. */
function products(count: number) {
  const last = count % 10;
  const teens = count % 100;

  if (count === 1) return "1 produkt";
  if (last >= 2 && last <= 4 && (teens < 12 || teens > 14)) return `${count} produkty`;

  return `${count} produktów`;
}

/**
 * The cart floats in the corner of the page rather than sitting in the header,
 * and it only exists once there is something in it — an empty cart is not a
 * thing to advertise on every route.
 *
 * It is still a real button with an accessible name that counts what it holds,
 * and it still sits in the document right after the header, so a keyboard user
 * reaches it after the navigation instead of hunting for it past the footer.
 * A reader without scripting gets nothing here; their way to the cart is the
 * link the shop index carries and the one the add-to-cart form prints.
 */
export function CartSheet({ animateEntrance }: { animateEntrance: boolean }) {
  const { cart, checkoutUrl, checkoutKnown, open } = useCart();

  /** Quantities may have moved in another tab, and the handover URL expires. */
  useEffect(() => {
    if (open) void loadCart(true);
  }, [open]);

  const count = cart?.itemCount ?? 0;

  return (
    <Sheet open={open} onOpenChange={setCartOpen}>
      <SheetTrigger
        aria-label={`Koszyk, ${products(count)}`}
        className={`floating-dock flex items-center justify-center gap-0.5 cursor-pointer rounded-full border border-paper/30 bg-navy size-13 text-paper shadow-[0_14px_34px_-14px] shadow-navy/50 transition-transform duration-150 ease-out hover:-translate-y-px active:scale-[0.97] ${
          animateEntrance
            ? "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200"
            : ""
        }`}
      >
        <HugeiconsIcon
          icon={ShoppingBag01Icon}
          strokeWidth={2}
          className="size-5"
          aria-hidden="true"
        />

        <span aria-hidden="true" className="text-sm font-semibold tabular-nums">
          {count}
        </span>
      </SheetTrigger>

      <SheetContent side="right" className="data-[side=right]:w-[min(24rem,88vw)]">
        <SheetHeader className="h-16 flex-row items-center border-b border-dashed border-hairline py-0 sm:h-18">
          <SheetTitle>Koszyk</SheetTitle>
        </SheetHeader>

        <div className="scrollview-fade scrollview-fade-y-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-3">
          {cart ? (
            cart.isEmpty ? (
              <div className="py-4">
                <p className="text-ink-muted">Koszyk jest pusty.</p>

                <Button asChild className="mt-5 w-full">
                  <Link href={SHOP_PATH} onClick={() => setCartOpen(false)}>
                    Wybierz akredytację
                  </Link>
                </Button>
              </div>
            ) : (
              <CartLines lines={cart.lines} dense />
            )
          ) : (
            <p className="text-sm text-ink-muted">Wczytujemy koszyk…</p>
          )}
        </div>

        {cart && !cart.isEmpty && (
          <SheetFooter className="border-t border-dashed border-hairline">
            <CartTotals cart={cart} />

            {checkoutUrl ? (
              <Button asChild className="mt-1 w-full py-3">
                <a href={checkoutUrl}>Przejdź do płatności</a>
              </Button>
            ) : checkoutKnown ? (
              <p className="mt-2 text-sm text-rose">{CHECKOUT_UNAVAILABLE}</p>
            ) : (
              /**
               * Adding to the cart fills the sheet from the action's own
               * result, which carries no handover URL, so for a moment there
               * is nothing to link to and nothing wrong either.
               */
              <Button className="mt-1 w-full py-3" disabled>
                Przejdź do płatności
              </Button>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
