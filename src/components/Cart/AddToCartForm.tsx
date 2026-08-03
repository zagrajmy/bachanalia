"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/warcraftcn/button";

import { addToCartAction } from "./actions";
import { CART_PATH } from "./paths";
import { QuantityInput } from "./QuantityInput";
import { openCart, setCart, useCart } from "./store";
import type { CartActionState } from "./types";
import {
  buildAxes,
  findVariation,
  initialSelection,
  isOptionAvailable,
  isSelectionUnavailable,
  type AttributeLabel,
  type ProductVariation,
  type VariationSelection,
} from "./variations";

type Props = {
  productId: number;
  slug: string;
  variations: ProductVariation[];
  attributeLabels: AttributeLabel[];
  soldOut: boolean;
  /** WooCommerce refuses a second unit, so no quantity is offered at all. */
  soldIndividually: boolean;
};

const initial: CartActionState = { ok: true, message: "" };

export function AddToCartForm({
  productId,
  slug,
  variations,
  attributeLabels,
  soldOut,
  soldIndividually,
}: Props) {
  const axes = buildAxes(variations, attributeLabels);
  const [selection, setSelection] = useState<VariationSelection>(() => initialSelection(axes));
  const [state, submit, pending] = useActionState(addToCartAction, initial);

  /**
   * Disabling the button until a size is picked reads the selection out of
   * React state, and without scripting that state never changes — so the
   * server render must leave it enabled or a reader without JavaScript can
   * never submit at all. The action validates the same rule server-side and
   * says "Wybierz wariant, zanim dodasz do koszyka." when it is broken.
   */
  const [interactive, setInteractive] = useState(false);

  useEffect(() => setInteractive(true), []);

  /**
   * The cart opens beside the product rather than replacing it — a buyer who
   * has just picked a size is usually still shopping. Without scripting the
   * action's message on the page below is the confirmation instead.
   *
   * A refusal from WooCommerce opens it too: "you cannot add another one of
   * these" is a fact about the cart, and showing the cart answers it better
   * than a second sentence explaining it would.
   */
  useEffect(() => {
    if (state.cart) {
      setCart(state.cart);
      openCart();

      return;
    }

    if (state.showCart) openCart();
  }, [state]);

  const chosen = findVariation(variations, axes, selection);
  const incomplete = axes.some((axis) => !selection[axis.name]);
  const unavailable = isSelectionUnavailable(variations, axes, selection);

  /**
   * WooCommerce refuses a second unit of these, so offering to add one again
   * is offering an error. The cart is what the buyer wants from the button at
   * that point, so the button becomes the cart.
   *
   * Only once the store has a cart to read, which is after mount — the server
   * render and a reader without scripting keep the real submit button, and the
   * action still answers "Nie możesz dodać kolejnej sztuki" for them.
   */
  const { cart } = useCart();
  const alreadyInCart =
    interactive &&
    soldIndividually &&
    (cart?.lines ?? []).some(
      (line) => line.slug === slug && (!chosen || line.variationId === chosen.variationId),
    );

  /**
   * Eleven shirt sizes at one price need no price list; two anthology options
   * at 25 and 45 zł do, and the option itself is where it belongs.
   */
  const pricesDiffer = variations.some((variation) => variation.price !== variations[0]?.price);

  const priceOf = (axisName: string, option: string) =>
    pricesDiffer
      ? findVariation(variations, axes, { ...selection, [axisName]: option })?.price
      : undefined;

  return (
    <form action={submit} className="mt-8">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="axisCount" value={axes.length} />
      {chosen && <input type="hidden" name="variationId" value={chosen.variationId} />}

      {axes.map((axis) => (
        <fieldset key={axis.name} className="mt-6 border-0 p-0">
          <legend className="eyebrow text-ink-muted">{axis.label}</legend>

          <div className="mt-3 flex flex-wrap gap-2">
            {axis.options.map((option) => {
              const available = isOptionAvailable(variations, axis.name, option, selection);
              const active = selection[axis.name] === option;
              const price = priceOf(axis.name, option);

              /**
               * Unbuyable on its own, as opposed to merely stranded by a change
               * on another axis. A stranded pick stays enabled and stays plainly
               * chosen: what cannot be sold is the combination, not this option,
               * and a radio that is both checked and disabled can take its whole
               * group out of the tab order. The sentence below the button names
               * the combination, and the submit button is already off.
               */
              const unbuyable = !available && !active;

              return (
                <label
                  key={option}
                  className={`rounded-card border px-3.5 py-3 text-sm transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                    unbuyable
                      ? "cursor-not-allowed border-hairline text-ink-muted line-through"
                      : active
                        ? "cursor-pointer border-navy bg-navy text-paper"
                        : "cursor-pointer border-hairline hover:border-navy"
                  }`}
                >
                  <input
                    type="radio"
                    name={`attr_${axis.name}`}
                    value={option}
                    checked={active}
                    disabled={unbuyable}
                    onChange={() => setSelection({ ...selection, [axis.name]: option })}
                    className="sr-only"
                  />
                  {option}
                  {unbuyable && <span className="sr-only"> — wyprzedane</span>}
                  {price && <span className="ml-2 tabular-nums opacity-80">{price}</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="mt-8 flex flex-wrap items-end gap-4">
        {soldIndividually ? (
          <input type="hidden" name="quantity" value={1} />
        ) : (
          <QuantityInput name="quantity" label="Ilość" defaultValue={1} />
        )}

        {alreadyInCart ? (
          <Button
            type="button"
            onClick={() => openCart()}
            className="px-8 py-3.5 text-[clamp(0.85rem,2.2vw,1rem)]"
          >
            Otwórz koszyk
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={soldOut || pending || (interactive && (incomplete || unavailable))}
            className="px-8 py-3.5 text-[clamp(0.85rem,2.2vw,1rem)]"
          >
            {pending ? "Dodajemy…" : "Dodaj do koszyka"}
          </Button>
        )}
      </div>

      <p aria-live="polite" className="mt-3 min-h-[1.5em] text-sm">
        {state.message ? (
          <span className={state.ok ? "text-ink-muted" : "text-rose"}>
            {state.message} {/**
             * With scripting the sheet is already open over this. Without it,
             * this sentence is the whole confirmation and this link is the only
             * way from a product page to the cart.
             */}
            <a className="text-ink-muted underline underline-offset-[0.25em]" href={CART_PATH}>
              Koszyk →
            </a>
          </span>
        ) : unavailable ? (
          <span className="text-rose">Ten wariant jest wyprzedany.</span>
        ) : incomplete && axes.length > 0 ? (
          <span className="text-ink-muted">Wybierz wariant.</span>
        ) : null}
      </p>
    </form>
  );
}
