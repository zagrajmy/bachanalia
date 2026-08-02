"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";

import { cartLineAction } from "./actions";
import { MAX_QUANTITY, STEP_CLASS } from "./quantity";
import { setCart } from "./store";
import type { CartActionState, CartLine } from "./types";

const initial: CartActionState = { ok: true, message: "" };

function LineForm({
  line,
  submit,
  pending,
}: {
  line: CartLine;
  pending: boolean;
  submit: (formData: FormData) => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const ceiling = line.soldIndividually ? 1 : MAX_QUANTITY;

  return (
    <form action={submit} ref={form} className="flex items-center gap-1.5">
      <input type="hidden" name="key" value={line.key} />
      <input type="hidden" name="name" value={line.name} />

      <button type="submit" className="sr-only">
        Zapisz ilość: {line.name}
      </button>

      <button
        type="submit"
        name="step"
        value="-1"
        className={STEP_CLASS}
        disabled={pending || line.quantity <= 1}
        aria-label={`Zmniejsz ilość: ${line.name}`}
      >
        −
      </button>

      <label className="sr-only" htmlFor={`qty-${line.key}`}>
        Ilość: {line.name}
      </label>

      <input
        key={line.quantity}
        id={`qty-${line.key}`}
        name="quantity"
        type="number"
        inputMode="numeric"
        min={0}
        max={ceiling}
        step={1}
        defaultValue={line.quantity}
        disabled={pending}
        onBlur={(event) => {
          if (Number(event.target.value) !== line.quantity) form.current?.requestSubmit();
        }}
        className="w-14 rounded-card border border-dashed border-hairline bg-transparent px-2 py-1.5 text-center tabular-nums"
      />

      <button
        type="submit"
        name="step"
        value="1"
        className={STEP_CLASS}
        disabled={pending || line.quantity >= ceiling}
        aria-label={`Zwiększ ilość: ${line.name}`}
      >
        +
      </button>
    </form>
  );
}

/**
 * `dense` drops the wide layout the page uses. The sheet is narrower than the
 * `sm` breakpoint but sits in a viewport that is not, so the columns have to
 * be told to stay stacked rather than asked.
 */
export function CartLines({ lines, dense = false }: { dense?: boolean; lines: CartLine[] }) {
  const [state, submit, pending] = useActionState(cartLineAction, initial);

  /** WooCommerce answers each mutation with the cart, so the chrome follows. */
  useEffect(() => {
    if (state.cart) setCart(state.cart);
  }, [state]);

  const wide = (classes: string) => (dense ? "" : classes);
  const current = state.cart?.lines ?? lines;

  return (
    <div>
      <p
        role="status"
        aria-live="polite"
        className={`min-h-[1.5em] text-sm ${state.ok ? "text-ink-muted" : "text-rose"}`}
      >
        {state.message}
      </p>

      <ul className="mt-2 border-t-2 border-navy">
        {current.map((line) => (
          <li
            key={line.key}
            className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-b border-dashed border-hairline py-5 ${wide(
              "sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-6",
            )}`}
          >
            <div className="size-16 shrink-0 overflow-hidden rounded-card border border-dashed border-hairline bg-paper-shade">
              {line.image && (
                <Image
                  alt=""
                  src={line.image.src}
                  width={64}
                  height={64}
                  className="size-full object-cover"
                />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="display text-[clamp(1rem,2.4vw,1.2rem)]">
                <Link className="no-underline hover:text-rose" href={line.href}>
                  {line.name}
                </Link>
              </h2>

              {line.options.map((option) => (
                <p key={option.label} className="mt-1 text-sm text-ink-muted">
                  <span className="eyebrow">{option.label}:</span> {option.value}
                </p>
              ))}
            </div>

            <div className={`col-start-2 ${wide("sm:col-start-auto")}`}>
              <LineForm line={line} submit={submit} pending={pending} />
            </div>

            <div
              className={`col-start-2 flex items-center justify-between gap-2 ${wide(
                "sm:col-start-auto sm:flex-col sm:items-end sm:gap-0",
              )}`}
            >
              <p className="display text-lg tabular-nums leading-none [text-box:trim-both_cap_alphabetic]">
                {line.total}
              </p>

              <form action={submit}>
                <input type="hidden" name="key" value={line.key} />
                <input type="hidden" name="name" value={line.name} />
                <input type="hidden" name="intent" value="remove" />
                <button
                  type="submit"
                  disabled={pending}
                  className="cursor-pointer text-sm text-ink-muted underline underline-offset-[0.25em] hover:text-rose disabled:opacity-50 leading-none"
                >
                  Usuń
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
