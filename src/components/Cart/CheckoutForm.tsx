"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/warcraftcn/button";

import { checkoutAction } from "./actions";
import { BILLING_FIELDS } from "./billing";
import { Field } from "./Field";
import { emptyCheckoutState, type PaymentGateway, type ShippingRate } from "./types";

type Props = {
  gateways: PaymentGateway[];
  shippingRates: ShippingRate[];
  chosenShippingMethod?: string;
  total: string;
};

const choiceClass =
  "flex cursor-pointer gap-3 rounded-card border border-dashed border-hairline p-4 transition-colors duration-150 hover:border-navy has-[:checked]:border-solid has-[:checked]:border-navy has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent";

export function CheckoutForm({ gateways, shippingRates, chosenShippingMethod, total }: Props) {
  const [state, submit, pending] = useActionState(checkoutAction, emptyCheckoutState);
  const locked = pending || state.indeterminate === true;

  return (
    <form action={submit} className="mt-8">
      <p aria-live="assertive" role="alert" className="min-h-[1.5em]">
        {state.message && (
          <span className="block rounded-card border border-rose px-4 py-3 text-sm text-rose">
            {state.message}
          </span>
        )}
      </p>

      <fieldset className="mt-8 border-0 p-0">
        <legend className="display text-[clamp(1.2rem,3vw,1.5rem)]">Dane zamawiającego</legend>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {BILLING_FIELDS.map((field) => (
            <Field
              key={field.name}
              field={field}
              error={state.fieldErrors[field.name]}
              disabled={locked}
            />
          ))}
        </div>
      </fieldset>

      {shippingRates.length > 1 && (
        <fieldset className="mt-10 border-0 p-0">
          <legend className="display text-[clamp(1.2rem,3vw,1.5rem)]">Odbiór</legend>

          <div className="mt-5 grid gap-3">
            {shippingRates.map((rate) => (
              <label key={rate.id} className={choiceClass}>
                <input
                  type="radio"
                  name="shippingMethod"
                  value={rate.id}
                  defaultChecked={rate.id === chosenShippingMethod}
                  disabled={locked}
                  className="mt-1 accent-navy"
                />
                <span className="text-sm">{rate.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="mt-10 border-0 p-0">
        <legend className="display text-[clamp(1.2rem,3vw,1.5rem)]">Płatność</legend>

        <div className="mt-5 grid gap-3">
          {gateways.map((gateway, index) => (
            <label key={gateway.id} className={choiceClass}>
              <input
                type="radio"
                name="paymentMethod"
                value={gateway.id}
                defaultChecked={index === 0}
                disabled={locked}
                className="mt-1 accent-navy"
              />
              <span>
                <span className="block font-semibold">{gateway.title}</span>
                {gateway.description && (
                  <span className="mt-1 block text-sm text-ink-muted">{gateway.description}</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-10">
        <label className="eyebrow block text-ink-muted" htmlFor="customerNote">
          Uwagi do zamówienia
        </label>
        <textarea
          id="customerNote"
          name="customerNote"
          rows={3}
          disabled={locked}
          className="mt-2 w-full rounded-card border border-dashed border-hairline bg-transparent px-3 py-2.5"
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t-2 border-navy pt-6">
        <p className="display text-[clamp(1.3rem,3.4vw,1.8rem)] tabular-nums">
          Do zapłaty {total}
        </p>

        <Button type="submit" disabled={locked} className="px-8 py-3.5">
          {pending ? "Składam zamówienie…" : "Zamawiam i płacę"}
        </Button>
      </div>
    </form>
  );
}
