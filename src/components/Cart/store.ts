"use client";

import { useSyncExternalStore } from "react";

import type { CartView } from "./types";

/**
 * The layout is static, so no server render of a page may know what is in the
 * cart — the count would be baked into the HTML every visitor shares. This is
 * the one copy the chrome reads: filled once after mount from `/api/cart`, and
 * kept current by the cart actions, which hand their result back rather than
 * making the browser ask again.
 *
 * A module-level store rather than a context, so the product page's form and
 * the header's trigger reach the same cart without a provider wrapping the
 * layout.
 */
export type CartSnapshot = {
  cart?: CartView;
  /**
   * Whether `/api/cart` has answered yet. Adding to the cart fills `cart` from
   * the action's own result without asking for a handover URL, so until this
   * flips an absent `checkoutUrl` means "not asked", not "no till" — and the
   * two must not look the same to a buyer.
   */
  checkoutKnown: boolean;
  /** WooCommerce's nonced handover URL, absent while the setting is off. */
  checkoutUrl?: string;
  loading: boolean;
  open: boolean;
};

const INITIAL: CartSnapshot = { open: false, loading: false, checkoutKnown: false };
const EMPTY_LINES: CartView["lines"] = [];

let snapshot = INITIAL;
let listeners: (() => void)[] = [];
let loaded = false;
/** Bumped by every mutation, so a slow read cannot undo a fresh one. */
let revision = 0;

function set(next: Partial<CartSnapshot>) {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];

  return () => {
    listeners = listeners.filter((entry) => entry !== listener);
  };
}

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => INITIAL,
  );
}

export function useCartLines() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot.cart?.lines ?? EMPTY_LINES,
    () => EMPTY_LINES,
  );
}

/**
 * A cart handed back by an action, which never carries a handover URL. An
 * empty cart is answered with no URL on purpose, so without clearing this a
 * buyer's first line would inherit "there is no till" from the load that
 * happened while the cart was still empty.
 */
export function setCart(cart: CartView) {
  loaded = true;
  revision++;
  set({ cart, checkoutKnown: false });
}

export function setCartOpen(open: boolean) {
  set({ open });
}

export function openCart() {
  set({ open: true });
}

/**
 * One request per page load, and one more each time the sheet opens — the
 * quantities may have moved in another tab, and `checkoutUrl` is only asked
 * for once there is something to check out with.
 */
export async function loadCart(force = false) {
  if (snapshot.loading || (loaded && !force)) return;

  const asked = revision;

  set({ loading: true });

  try {
    /** `trailingSlash` is on, and the slashless form costs a 308 first. */
    const response = await fetch("/api/cart/", { headers: { accept: "application/json" } });

    if (!response.ok) {
      set({ loading: false });
      return;
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- our own route handler, and this is the shape it answers with
    const body = (await response.json()) as { cart: CartView; checkoutUrl?: string };

    loaded = true;

    /** A stepper pressed while this was in flight already knows better. */
    if (revision !== asked) {
      set({ checkoutUrl: body.checkoutUrl, checkoutKnown: true, loading: false });
      return;
    }

    set({ cart: body.cart, checkoutUrl: body.checkoutUrl, checkoutKnown: true, loading: false });
  } catch {
    set({ loading: false });
  }
}
