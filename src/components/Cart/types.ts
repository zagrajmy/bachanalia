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
  key: string;
  name: string;
  slug: string;
  href: string;
  quantity: number;
  subtotal: string;
  total: string;
  image?: { src: string; alt: string };
  /** The chosen variation, spelled out. A shirt size has to be visible here. */
  options: CartLineOption[];
  variationId?: number;
};

export type ShippingRate = { id: string; label: string; cost: string };

export type CartView = {
  isEmpty: boolean;
  itemCount: number;
  subtotal: string;
  total: string;
  shippingTotal: string;
  discountTotal: string;
  needsShippingAddress: boolean;
  chosenShippingMethods: string[];
  shippingRates: ShippingRate[];
  lines: CartLine[];
};

/** What a cart form hands back to its `useActionState`. */
export type CartActionState = {
  ok: boolean;
  /** Announced in a live region, so it is written for a screen reader too. */
  message: string;
};
