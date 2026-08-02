"use server";

import { print } from "graphql/language/printer";
import { redirect } from "next/navigation";

import { ProductVariationsQuery } from "@/queries/cart/ProductVariationsQuery";

import { addToCart, removeLine, setQuantity } from "./cart";
import { CART_PATH } from "./paths";
import { wooRequest } from "./session";
import type { CartActionState } from "./types";
import { findVariation, buildAxes, type ProductVariation } from "./variations";

const ATTRIBUTE_PREFIX = "attr_";

const MAX_QUANTITY = 20;

function readAttributes(formData: FormData) {
  const pairs: { attributeName: string; attributeValue: string }[] = [];

  formData.forEach((value, name) => {
    if (name.indexOf(ATTRIBUTE_PREFIX) !== 0 || typeof value !== "string" || !value) return;
    pairs.push({ attributeName: name.slice(ATTRIBUTE_PREFIX.length), attributeValue: value });
  });

  return pairs;
}

/**
 * WooCommerce refuses a variable product without a `variationId`, and it
 * checks that the id belongs to the product it was sent with — a posted id
 * cannot be swapped for a cheaper product's. When the browser could not
 * resolve one, ask WooCommerce.
 */
async function resolveVariationId(slug: string, selection: { [name: string]: string }) {
  const result = await wooRequest<{
    products?: {
      nodes?:
        | {
            variations?: {
              nodes?:
                | {
                    databaseId?: number | null;
                    stockStatus?: string | null;
                    attributes?: {
                      nodes?: { name?: string | null; value?: string | null }[] | null;
                    } | null;
                  }[]
                | null;
            } | null;
          }[]
        | null;
    } | null;
  }>(print(ProductVariationsQuery), { slugs: [slug] }, "read");

  if (!result.ok) return undefined;

  const variations: ProductVariation[] = (
    result.data.products?.nodes?.[0]?.variations?.nodes ?? []
  ).flatMap((node) =>
    node?.databaseId
      ? [
          {
            variationId: node.databaseId,
            price: "",
            soldOut: node.stockStatus === "OUT_OF_STOCK",
            attributes: (node.attributes?.nodes ?? []).flatMap((attribute) =>
              attribute?.name ? [{ name: attribute.name, value: attribute.value ?? "" }] : [],
            ),
          },
        ]
      : [],
  );

  return findVariation(variations, buildAxes(variations), selection)?.variationId;
}

export async function addToCartAction(
  _state: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const productId = Number(formData.get("productId"));
  const slug = String(formData.get("slug") ?? "");
  const quantity = Math.min(Math.max(Number(formData.get("quantity")) || 1, 1), MAX_QUANTITY);
  const attributes = readAttributes(formData);
  const expectedAxes = Number(formData.get("axisCount")) || 0;

  if (!productId) return { ok: false, message: "Nie rozpoznajemy tego produktu." };

  if (attributes.length < expectedAxes) {
    return { ok: false, message: "Wybierz wariant, zanim dodasz do koszyka." };
  }

  let variationId = Number(formData.get("variationId")) || undefined;

  if (!variationId && attributes.length > 0 && slug) {
    const selection: { [name: string]: string } = {};
    for (const pair of attributes) selection[pair.attributeName] = pair.attributeValue;
    variationId = await resolveVariationId(slug, selection);
  }

  if (!variationId && expectedAxes > 0) {
    return { ok: false, message: "Ten wariant jest niedostępny." };
  }

  const result = await addToCart({
    productId,
    quantity,
    ...(variationId && { variationId, variation: attributes }),
  });

  if (!result.ok) return { ok: false, message: result.message };

  redirect(CART_PATH);
}

/**
 * One action behind every control on a cart line, so the page has one live
 * region to announce into instead of a status message per row.
 *
 * `step` is what the − and + buttons carry: it applies on top of whatever the
 * number input currently holds, so typing 5 and pressing + means 6. Both are
 * plain submit buttons, which is why the whole cart works with scripting off.
 */
export async function cartLineAction(
  _state: CartActionState,
  formData: FormData,
): Promise<CartActionState> {
  const key = String(formData.get("key") ?? "");
  const name = String(formData.get("name") ?? "Pozycja");

  if (!key) return { ok: false, message: "Nie znaleźliśmy tej pozycji." };

  if (formData.get("intent") === "remove") {
    const removed = await removeLine(key);

    return removed.ok
      ? { ok: true, message: `${name} — usunięto z koszyka.` }
      : { ok: false, message: removed.message };
  }

  const typed = Number(formData.get("quantity")) || 0;
  const step = Number(formData.get("step")) || 0;
  const quantity = Math.min(Math.max(typed + step, 0), MAX_QUANTITY);

  const result = await setQuantity(key, quantity);

  if (!result.ok) return { ok: false, message: result.message };

  return {
    ok: true,
    message:
      quantity === 0
        ? `${name} — usunięto z koszyka.`
        : `${name} — ilość zmieniona na ${quantity}.`,
  };
}

/**
 * WooCommerce's order-received URL is the classic gateway-less return value.
 * Following it would hand the buyer back to WordPress at the last step, so a
 * `bacs` order finishes here instead and the confirmation page carries the
 * link on for the bank details.
 */
