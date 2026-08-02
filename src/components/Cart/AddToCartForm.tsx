"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/warcraftcn/button";

import { addToCartAction } from "./actions";
import { QuantityInput } from "./QuantityInput";
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
};

const initial: CartActionState = { ok: true, message: "" };

export function AddToCartForm({ productId, slug, variations, attributeLabels, soldOut }: Props) {
  const axes = buildAxes(variations, attributeLabels);
  const [selection, setSelection] = useState<VariationSelection>(() => initialSelection(axes));
  const [state, submit, pending] = useActionState(addToCartAction, initial);

  const chosen = findVariation(variations, axes, selection);
  const incomplete = axes.some((axis) => !selection[axis.name]);
  const unavailable = isSelectionUnavailable(variations, axes, selection);

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

              return (
                <label
                  key={option}
                  className={`cursor-pointer rounded-card border px-3 py-1.5 text-sm transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
                    active
                      ? "border-navy bg-navy text-paper"
                      : "border-dashed border-hairline hover:border-navy"
                  } ${available ? "" : "cursor-not-allowed text-ink-muted line-through"}`}
                >
                  <input
                    type="radio"
                    name={`attr_${axis.name}`}
                    value={option}
                    checked={active}
                    disabled={!available}
                    onChange={() => setSelection({ ...selection, [axis.name]: option })}
                    className="sr-only"
                  />
                  {option}
                  {priceOf(axis.name, option) && (
                    <span className="ml-2 tabular-nums opacity-80">
                      {priceOf(axis.name, option)}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="mt-8 flex flex-wrap items-end gap-4">
        <QuantityInput name="quantity" label="Ilość" defaultValue={1} />

        <Button
          type="submit"
          disabled={soldOut || pending || incomplete || unavailable}
          className="px-8 py-3.5 text-[clamp(0.85rem,2.2vw,1rem)]"
        >
          {pending ? "Dodaję…" : "Dodaj do koszyka"}
        </Button>
      </div>

      <p aria-live="polite" className="mt-3 min-h-[1.5em] text-sm">
        {state.message ? (
          <span className="text-rose">{state.message}</span>
        ) : unavailable ? (
          <span className="text-rose">Ten wariant jest wyprzedany.</span>
        ) : incomplete && axes.length > 0 ? (
          <span className="text-ink-muted">Wybierz wariant.</span>
        ) : null}
      </p>
    </form>
  );
}
