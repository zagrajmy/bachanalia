import { readSnapshots } from "./fixtures";

/**
 * The cart half of the mock is a state machine, not a canned reply: a spec that
 * adds a line and then removes it has to see the next `CartQuery` change, or it
 * is asserting nothing. What the machine hands back is still WooCommerce's own
 * recorded payload — prices included, because money is never computed here.
 */
type Line = { key: string; productId: number; quantity: number; variationId: number };

type CartNode = {
  contents?: { itemCount?: number; nodes?: { key?: string; quantity?: number }[] };
  isEmpty?: boolean;
};

const carts: Record<string, Line[]> = {};

const signature = (lines: Line[]) =>
  lines
    .map((line) => `${line.productId}:${line.variationId}:${line.quantity}`)
    .sort()
    .join("|");

const clone = <T>(value: T): T => structuredClone(value);

/** Only reached when the fixtures are missing entirely, and it says so. */
function noSnapshots(what: string): CartNode {
  console.error(`[mock-wp] no recorded cart for ${what}; run \`bun run e2e:record --cart\``);

  return { isEmpty: true, contents: { itemCount: 0, nodes: [] } };
}

function snapshotFor(lines: Line[]): CartNode {
  const snapshots = readSnapshots();

  if (lines.length === 0) {
    return snapshots.empty ? clone(snapshots.empty) : noSnapshots("an empty cart");
  }

  const exact = snapshots.carts[signature(lines)];
  if (exact) return clone(exact);

  /**
   * Nothing recorded at this quantity. Quantities and counts are integers, not
   * money, so the single-line snapshot can carry them — but the line's totals
   * stay exactly as WooCommerce printed them, which is why the recorder walks
   * the quantities the specs actually use.
   */
  const first = lines[0];
  const base = first && snapshots.carts[`${first.productId}:${first.variationId}:1`];

  if (!first || !base) return noSnapshots(signature(lines));

  const cart = clone(base) as CartNode;
  const node = cart.contents?.nodes?.[0];

  if (node) node.quantity = first.quantity;
  if (cart.contents) cart.contents.itemCount = first.quantity;

  return cart;
}

/**
 * WooCommerce derives a cart item's key from the product and the variation, so
 * the recorded one is the right one to hand back — and it is what the specs
 * drive the stepper and the remove button with.
 */
function recordedKey(productId: number, variationId: number) {
  const base = readSnapshots().carts[`${productId}:${variationId}:1`] as CartNode | undefined;

  return base?.contents?.nodes?.[0]?.key ?? `${productId}-${variationId}`;
}

export function cartOf(token: string) {
  return carts[token] ?? [];
}

export function addLine(token: string, productId: number, variationId: number, quantity: number) {
  const lines = [...cartOf(token)];
  const found = lines.filter(
    (line) => line.productId === productId && line.variationId === variationId,
  )[0];

  if (found) found.quantity += quantity;
  else lines.push({ productId, variationId, quantity, key: recordedKey(productId, variationId) });

  carts[token] = lines;
}

export function setLineQuantity(token: string, key: string, quantity: number) {
  carts[token] = cartOf(token)
    .map((line) => (line.key === key ? { ...line, quantity } : line))
    .filter((line) => line.quantity > 0);
}

export function removeLines(token: string, keys: string[]) {
  carts[token] = cartOf(token).filter((line) => !keys.includes(line.key));
}

export function cartResponse(token: string) {
  return snapshotFor(cartOf(token));
}
