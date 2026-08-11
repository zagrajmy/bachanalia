import { productPath } from "@/components/Globals/siteNav";
import type { CartFieldsFragment } from "@/gql/graphql";
import type { Selected } from "@/utils/graphqlSelection";
import { formatPrice } from "@/content/shop";
import { AddToCartMutation } from "@/queries/cart/AddToCartMutation";
import { CartQuery } from "@/queries/cart/CartQuery";
import { CheckoutUrlQuery } from "@/queries/cart/CheckoutUrlQuery";
import { RemoveItemsFromCartMutation } from "@/queries/cart/RemoveItemsFromCartMutation";
import { UpdateItemQuantitiesMutation } from "@/queries/cart/UpdateItemQuantitiesMutation";

import { readSession, wooRequest, type WooResult } from "./session";
import type { CartLine, CartView } from "./types";

type CartNode = CartFieldsFragment;

type CartItemNode = NonNullable<CartNode["contents"]>["nodes"][number];

/** WooCommerce has a concrete type per product kind, so a line's product is a union. */
type CartProductNode = Selected<NonNullable<CartItemNode["product"]>["node"]>;

export const EMPTY_CART: CartView = {
  isEmpty: true,
  itemCount: 0,
  subtotal: "",
  total: "",
  shippingTotal: "",
  discountTotal: "",
  needsShippingAddress: false,
  chosenShippingMethods: [],
  shippingRates: [],
  lines: [],
};

/**
 * WooCommerce's own attribute label if the product carries one, otherwise the
 * sanitised name made readable — "rozmar-koszulki" is not a caption.
 */
function humanise(name: string) {
  const spaced = name.replaceAll(/[-_]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function toLine(node: CartItemNode): CartLine | undefined {
  const product: CartProductNode | undefined = node.product?.node;

  if (!node.key || !product?.name || !product.slug) return undefined;

  const labels = product.attributes?.nodes ?? [];
  const labelFor = (name: string) => {
    for (const attribute of labels) {
      if (attribute?.name === name && attribute.label) return attribute.label;
    }

    return humanise(name);
  };

  return {
    key: node.key,
    name: product.name,
    slug: product.slug,
    href: productPath(product.slug),
    quantity: node.quantity ?? 1,
    soldIndividually: product.soldIndividually === true,
    subtotal: formatPrice(node.subtotal),
    total: formatPrice(node.total),
    ...(product.image?.sourceUrl && {
      image: { src: product.image.sourceUrl, alt: product.image.altText || "" },
    }),
    options: (node.variation?.attributes ?? []).flatMap((attribute) =>
      attribute?.name && attribute.value
        ? [{ label: labelFor(attribute.name), value: attribute.value }]
        : [],
    ),
    ...(node.variation?.node?.databaseId && { variationId: node.variation.node.databaseId }),
  };
}

export function toCartView(cart: CartNode | null | undefined): CartView {
  if (!cart) return EMPTY_CART;

  const lines = (cart.contents?.nodes ?? []).flatMap((node) => {
    const line = toLine(node);
    return line ? [line] : [];
  });

  return {
    isEmpty: cart.isEmpty ?? lines.length === 0,
    itemCount: cart.contents?.itemCount ?? 0,
    subtotal: formatPrice(cart.subtotal),
    total: formatPrice(cart.total),
    shippingTotal: formatPrice(cart.shippingTotal),
    discountTotal: formatPrice(cart.discountTotal),
    needsShippingAddress: cart.needsShippingAddress ?? false,
    chosenShippingMethods: (cart.chosenShippingMethods ?? []).flatMap((id) => (id ? [id] : [])),
    shippingRates: (cart.availableShippingMethods ?? []).flatMap((pkg) =>
      (pkg?.rates ?? []).flatMap((rate) =>
        rate?.id && rate.label
          ? [{ id: rate.id, label: rate.label, cost: formatPrice(rate.cost) }]
          : [],
      ),
    ),
    lines,
  };
}

function unwrap<K extends string, T extends Partial<Record<K, { cart?: CartNode | null } | null>>>(
  result: WooResult<T>,
  field: K,
): WooResult<CartView> {
  if (!result.ok) return result;

  return { ok: true, data: toCartView(result.data[field]?.cart) };
}

/**
 * Where "Przejdź do płatności" goes. Undefined while the setting is off, and
 * the cart says so rather than sending a buyer to a checkout that would greet
 * them with an empty basket.
 */
export async function fetchCheckoutUrl(): Promise<string | undefined> {
  const result = await wooRequest(CheckoutUrlQuery, {}, "read");

  return result.ok ? (result.data.customer?.checkoutUrl ?? undefined) : undefined;
}

/**
 * No session means no cart, and asking a rate-limited WordPress to confirm
 * that for every visitor is a request nobody needs.
 */
export async function fetchCart(): Promise<WooResult<CartView>> {
  if (!(await readSession())) return { ok: true, data: EMPTY_CART };

  const result = await wooRequest(CartQuery, {}, "read");

  return result.ok ? { ok: true, data: toCartView(result.data.cart) } : result;
}

export type AddToCartArgs = {
  productId: number;
  quantity: number;
  variation?: { attributeName: string; attributeValue: string }[];
  variationId?: number;
};

export async function addToCart(args: AddToCartArgs) {
  return unwrap(await wooRequest(AddToCartMutation, { input: args }, "replayable"), "addToCart");
}

export async function setQuantity(key: string, quantity: number) {
  return unwrap(
    await wooRequest(
      UpdateItemQuantitiesMutation,
      { input: { items: [{ key, quantity }] } },
      "replayable",
    ),
    "updateItemQuantities",
  );
}

export async function removeLine(key: string) {
  return unwrap(
    await wooRequest(RemoveItemsFromCartMutation, { input: { keys: [key] } }, "replayable"),
    "removeItemsFromCart",
  );
}
