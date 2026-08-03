"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useOptimistic, useRef } from "react";

import { cartLineAction } from "./actions";
import { GROUP_CLASS, INPUT_CLASS, MAX_QUANTITY, STEP_CLASS } from "./quantity";
import { setCart } from "./store";
import type { CartActionState, CartLine } from "./types";

const initial: CartActionState = { ok: true, message: "" };

function LineForm({
  line,
  submit,
  onSubmit,
}: {
  line: CartLine;
  submit: (formData: FormData) => void;
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const ceiling = line.soldIndividually ? 1 : MAX_QUANTITY;

  /** A stepper pinned to 1 is two dead buttons; say the fact instead. */
  if (line.soldIndividually) {
    return <p className="text-sm text-ink-muted">1 szt.</p>;
  }

  return (
    <form action={submit} onSubmit={onSubmit} ref={form}>
      <input type="hidden" name="key" value={line.key} />
      <input type="hidden" name="name" value={line.name} />

      <button type="submit" className="sr-only">
        Zapisz ilość: {line.name}
      </button>

      <div className={GROUP_CLASS}>
        <button
          type="submit"
          name="step"
          value="-1"
          className={STEP_CLASS}
          disabled={line.quantity <= 1}
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
          onBlur={(event) => {
            if (Number(event.target.value) !== line.quantity)
              form.current?.requestSubmit();
          }}
          className={INPUT_CLASS}
        />

        <button
          type="submit"
          name="step"
          value="1"
          className={STEP_CLASS}
          disabled={line.quantity >= ceiling}
          aria-label={`Zwiększ ilość: ${line.name}`}
        >
          +
        </button>
      </div>
    </form>
  );
}

/**
 * `dense` drops the wide layout the page uses. The sheet is narrower than the
 * `sm` breakpoint but sits in a viewport that is not, so the columns have to
 * be told to stay stacked rather than asked.
 */
export function CartLines({
  lines,
  dense = false,
}: {
  dense?: boolean;
  lines: CartLine[];
}) {
  const [state, submit] = useActionState(cartLineAction, initial);

  /** WooCommerce answers each mutation with the cart, so the chrome follows. */
  useEffect(() => {
    if (state.cart) setCart(state.cart);
  }, [state]);

  const wide = (classes: string) => (dense ? "" : classes);
  const current = state.cart?.lines ?? lines;

  /**
   * The list answers before WooCommerce does. React resets this to `current`
   * when the action settles, so a refusal rolls the line back on its own and
   * the status region below says why. Only the quantity moves optimistically —
   * the zł figures stay WooCommerce's until the reply lands.
   */
  const [optimisticLines, patchLine] = useOptimistic(
    current,
    (list: CartLine[], patch: { key: string; quantity: number }) =>
      patch.quantity === 0
        ? list.filter((line) => line.key !== patch.key)
        : list.map((line) =>
            line.key === patch.key ? { ...line, quantity: patch.quantity } : line,
          ),
  );

  /**
   * Layered over `action={submit}` rather than wrapping it, because a client
   * wrapper would cost the plain-form fallback: with scripting off this
   * handler never runs and the POST goes through untouched.
   */
  const submitOptimistically = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const submitter = event.nativeEvent.submitter;
    const formData = new FormData(event.currentTarget, submitter);

    const key = String(formData.get("key") ?? "");
    const typed = Number(formData.get("quantity")) || 0;
    const step = Number(formData.get("step")) || 0;

    const quantity =
      formData.get("intent") === "remove"
        ? 0
        : Math.min(Math.max(typed + step, 0), MAX_QUANTITY);

    startTransition(() => {
      patchLine({ key, quantity });
      submit(formData);
    });
  };

  return (
    <div>
      <ul>
        {optimisticLines.map((line) => (
          <li
            key={line.key}
            className={`flex items-start gap-4 border-b border-dashed border-hairline py-4 ${wide(
              "sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] sm:items-center sm:gap-x-6",
            )}`}
          >
            <div className="size-16 shrink-0 overflow-hidden bg-paper-shade">
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

            <div
              className={`flex min-w-0 flex-1 flex-col gap-1 ${wide("sm:contents")}`}
            >
              <div className="min-w-0">
                <h2 className="display text-[clamp(1rem,2.4vw,1.2rem)]">
                  <Link
                    className="no-underline hover:text-rose"
                    href={line.href}
                  >
                    {line.name}
                  </Link>
                </h2>

                {line.options.map((option) => (
                  <p key={option.label} className="mt-1 text-sm text-ink-muted">
                    <span className="eyebrow">{option.label}:</span>{" "}
                    {option.value}
                  </p>
                ))}
              </div>

              <LineForm line={line} submit={submit} onSubmit={submitOptimistically} />

              <div
                className={`flex items-center justify-between gap-2 ${wide(
                  "sm:flex-col sm:items-end sm:gap-1",
                )}`}
              >
                <p className="display text-lg tabular-nums leading-none [text-box:trim-both_cap_alphabetic]">
                  {line.total}
                </p>

                <form action={submit} onSubmit={submitOptimistically}>
                  <input type="hidden" name="key" value={line.key} />
                  <input type="hidden" name="name" value={line.name} />
                  <input type="hidden" name="intent" value="remove" />
                  <button
                    type="submit"
                    className="-m-1 cursor-pointer p-1 text-sm leading-none text-ink-muted underline underline-offset-[0.25em] hover:text-rose disabled:opacity-50"
                  >
                    Usuń
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p
        role="status"
        aria-live="polite"
        className={`mt-2 min-h-[1.5em] text-sm ${state.ok ? "text-ink-muted" : "text-rose"}`}
      >
        {state.message}
      </p>
    </div>
  );
}
