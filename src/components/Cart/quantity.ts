/**
 * The ceiling on any one line. Nothing in this shop is sold by the crate, so
 * this is a guard against a fat-fingered order rather than a stock rule — and
 * it has to read the same in the picker, the cart line and the action that
 * clamps whatever arrives.
 */
export const MAX_QUANTITY = 20;

/** The − and + around a quantity input, wherever that input appears. */
export const STEP_CLASS =
  "flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-card border border-dashed border-hairline text-lg leading-none transition-colors duration-150 hover:border-navy disabled:cursor-not-allowed disabled:opacity-40";
