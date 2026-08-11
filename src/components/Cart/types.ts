/**
 * Shapes shared by the server modules and the client forms. Nothing here
 * imports `next/headers` or a query document, so a client component can pull
 * a type without dragging the WordPress transport into the browser bundle.
 *
 * Every money field is WooCommerce's own formatted string. There is no
 * numeric total anywhere in this feature on purpose.
 */

export type CartLineOption = { label: string; value: string };

export type CartLine = {
  /** WooCommerce's cart item hash — the handle for update and remove. */
  href: string;
  image?: { alt: string; src: string };
  key: string;
  name: string;
  /** The chosen variation, spelled out. A shirt size has to be visible here. */
  options: CartLineOption[];
  quantity: number;
  slug: string;
  /** WooCommerce refuses a second unit, so the stepper stops at one. */
  soldIndividually: boolean;
  subtotal: string;
  total: string;
  variationId?: number;
};

export type ShippingRate = { cost: string; id: string; label: string };

export type CartView = {
  chosenShippingMethods: string[];
  discountTotal: string;
  isEmpty: boolean;
  itemCount: number;
  lines: CartLine[];
  needsShippingAddress: boolean;
  shippingRates: ShippingRate[];
  shippingTotal: string;
  subtotal: string;
  total: string;
};

/** What a cart form hands back to its `useActionState`. */
export type CartActionState = {
  ok: boolean;
  /**
   * WooCommerce answers every cart mutation with the whole cart, so the sheet
   * and the header count redraw from the reply instead of asking again.
   */
  cart?: CartView;
  /** Announced in a live region, so it is written for a screen reader too. */
  message: string;
  /**
   * A refusal that is about what is already in the cart — "you cannot add
   * another of these" — so the cart is what should come up alongside it.
   */
  showCart?: boolean;
};
