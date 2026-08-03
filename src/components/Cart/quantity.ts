/**
 * The ceiling on any one line. Nothing in this shop is sold by the crate, so
 * this is a guard against a fat-fingered order rather than a stock rule — and
 * it has to read the same in the picker, the cart line and the action that
 * clamps whatever arrives.
 */
export const MAX_QUANTITY = 20;

/**
 * One solid frame around the whole control; the − and + sit flush inside it,
 * split off by hairlines, wherever a quantity input appears.
 */
export const GROUP_CLASS =
  "flex w-fit items-stretch divide-x divide-hairline rounded-card border border-hairline transition-colors duration-150 has-[input:focus]:border-navy";

export const STEP_CLASS =
  "flex w-9 shrink-0 cursor-pointer items-center justify-center text-lg leading-none transition-colors duration-150 hover:bg-paper-shade disabled:cursor-not-allowed disabled:opacity-40";

export const INPUT_CLASS =
  "w-14 bg-transparent px-2 py-1.5 text-center tabular-nums focus:outline-none";
