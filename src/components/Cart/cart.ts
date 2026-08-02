import { print } from "graphql/language/printer";

import { productPath } from "@/components/Globals/siteNav";
import { formatPrice } from "@/content/shop";
import { AddToCartMutation } from "@/queries/cart/AddToCartMutation";
import { CartQuery } from "@/queries/cart/CartQuery";
import { CheckoutUrlQuery } from "@/queries/cart/CheckoutUrlQuery";
import { RemoveItemsFromCartMutation } from "@/queries/cart/RemoveItemsFromCartMutation";
import { UpdateItemQuantitiesMutation } from "@/queries/cart/UpdateItemQuantitiesMutation";

import { readSession, wooRequest, type WooResult } from "./session";
import type { CartLine, CartView } from "./types";

type AttributeNode = { name?: string | null; label?: string | null; value?: string | null };

type CartItemNode = {
  key?: string | null;
  quantity?: number | null;
  subtotal?: string | null;
  total?: string | null;
  product?: {
    node?: {
      databaseId?: number | null;
      name?: string | null;
      slug?: string | null;
      image?: { sourceUrl?: string | null; altText?: string | null } | null;
      attributes?: { nodes?: AttributeNode[] | null } | null;
    } | null;
  } | null;
  variation?: {
    node?: { databaseId?: number | null; name?: string | null } | null;
    attributes?: AttributeNode[] | null;
  } | null;
};

type CartNode = {
  isEmpty?: boolean | null;
  subtotal?: string | null;
  total?: string | null;
  shippingTotal?: string | null;
  discountTotal?: string | null;
  needsShippingAddress?: boolean | null;
  chosenShippingMethods?: (string | null)[] | null;
  availableShippingMethods?:
    | ({
        rates?:
          | ({ id?: string | null; label?: string | null; cost?: string | null } | null)[]
          | null;
      } | null)[]
    | null;
  contents?: { itemCount?: number | null; nodes?: CartItemNode[] | null } | null;
};

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
  const spaced = name.replace(/[-_]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function toLine(node: CartItemNode): CartLine | undefined {
  const product = node.product?.node;

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

function unwrap<K extends string>(
  result: WooResult<{ [key in K]?: { cart?: CartNode | null } | null }>,
  field: K,
): WooResult<CartView> {
  if (!result.ok) return result;

  return { ok: true, data: toCartView(result.data[field]?.cart) };
}

/**
 * No session means no cart, and asking a rate-limited WordPress to confirm
 * that for every visitor is a request nobody needs.
 */
/**
 * Where "Przejdź do płatności" goes. Undefined while the setting is off, and
 * the cart says so rather than sending a buyer to a checkout that would greet
 * them with an empty basket.
 */
export async function fetchCheckoutUrl(): Promise<string | undefined> {
  const result = await wooRequest<{ customer?: { checkoutUrl?: string | null } | null }>(
    print(CheckoutUrlQuery),
    {},
    "read",
  );

  return result.ok ? (result.data.customer?.checkoutUrl ?? undefined) : undefined;
}

export async function fetchCart(): Promise<WooResult<CartView>> {
  if (!(await readSession())) return { ok: true, data: EMPTY_CART };

  const result = await wooRequest<{ cart?: CartNode | null }>(print(CartQuery), {}, "read");

  return result.ok ? { ok: true, data: toCartView(result.data.cart) } : result;
}

export type AddToCartArgs = {
  productId: number;
  quantity: number;
  variationId?: number;
  variation?: { attributeName: string; attributeValue: string }[];
};

export async function addToCart(args: AddToCartArgs) {
  return unwrap(
    await wooRequest<{ addToCart?: { cart?: CartNode | null } | null }>(
      print(AddToCartMutation),
      { input: args },
      "replayable",
    ),
    "addToCart",
  );
}

export async function setQuantity(key: string, quantity: number) {
  return unwrap(
    await wooRequest<{ updateItemQuantities?: { cart?: CartNode | null } | null }>(
      print(UpdateItemQuantitiesMutation),
      { input: { items: [{ key, quantity }] } },
      "replayable",
    ),
    "updateItemQuantities",
  );
}

export async function removeLine(key: string) {
  return unwrap(
    await wooRequest<{ removeItemsFromCart?: { cart?: CartNode | null } | null }>(
      print(RemoveItemsFromCartMutation),
      { input: { keys: [key] } },
      "replayable",
    ),
    "removeItemsFromCart",
  );
}

/**
 * Gateways that cannot be driven from here, whatever WooCommerce says about
 * them being enabled.
 *
 * Both read a field the buyer types on WooCommerce's own checkout page
 * through `filter_input(INPUT_POST, …)`. WPGraphQL only accepts an
 * `application/json` body, so PHP's `$_POST` is empty by the time the gateway
 * looks, and each refuses before an order exists — "Podaj kod BLIK" and
 * "Aby przejść do płatności dokonaj wyboru banku z listy poniżej". Offering
 * them here would walk a buyer through the whole form into a wall.
 *
 * `pay_by_paynow_pl_paywall` is the one that works: no posted fields, and
 * `process_payment()` returns Paynow's paywall URL, where BLIK, transfer and
 * card all live. It is not switched on in WooCommerce yet, and this list is a
 * denial rather than an allowance so it appears on its own when it is.
 */
const GATEWAYS_NEEDING_POSTED_FIELDS = ["pay_by_paynow_pl_blik", "pay_by_paynow_pl_pbl"];
