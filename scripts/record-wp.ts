/**
 * Re-record the e2e fixtures from the live WordPress. Run by hand, never from
 * `bun run test` and never from CI:
 *
 *     bun scripts/record-wp.ts            # reads only
 *     bun scripts/record-wp.ts --cart     # also re-records the cart snapshots
 *
 * The default pass is read-only: it boots the app with `MOCK_WP=record`, walks
 * the routes the specs visit, and saves every GraphQL answer that comes back.
 *
 * `--cart` additionally opens one guest WooCommerce session, puts a shirt in it
 * at quantities 1–3, then empties it. It never calls `checkout`, so no order is
 * created and nothing is charged; all it leaves behind is a session row that
 * expires in 48 hours.
 */
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { print } from "graphql/language/printer";

import { AddToCartMutation } from "../src/queries/cart/AddToCartMutation";
import { CartQuery } from "../src/queries/cart/CartQuery";
import { CheckoutUrlQuery } from "../src/queries/cart/CheckoutUrlQuery";
import { RemoveItemsFromCartMutation } from "../src/queries/cart/RemoveItemsFromCartMutation";
import { UpdateItemQuantitiesMutation } from "../src/queries/cart/UpdateItemQuantitiesMutation";
import { readSnapshots, writeSnapshots, type CartSnapshots } from "../mocks/fixtures";
import { footerNav, primaryNav } from "../src/components/Globals/siteNav";

/** Its own output directory, so a `bun run dev` in this repo keeps working. */
const DIST_DIR = ".next-mock";

const PORT = Number(process.env.RECORD_PORT ?? 3181);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const GRAPHQL = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/graphql`;

/** The shirt the cart specs buy, and the size they pick. */
const CART_PRODUCT = { slug: "golden-ticket", attribute: "rozmar-koszulki", option: "MĘSKA L" };

const EXTRA_ROUTES = [
  "/",
  "/sklep/",
  "/sklep/koszyk/",
  "/aktualnosci/",
  "/goscie/",
  "/regulamin/",
  "/czas-i-miejsce/",
  "/co-to-sa-bachanalia/",
  "/blok-komiksowy/",
  "/sztab-bachanaliowy/",
  "/wspieraja-nas/",
  "/produkt/golden-ticket/",
  "/produkt/akredytacja-3-dniowa/",
  /** shop.spec asserts this 404s rather than rendering an empty page. */
  "/produkt/nie-ma-takiego-produktu/",
];

/** navigation.spec walks every destination the header and footer declare. */
const navRoutes = [
  ...primaryNav.flatMap((group) => [group, ...(group.children ?? [])]),
  ...footerNav.flatMap((group) => group.links),
]
  .filter((link) => !("external" in link && link.external))
  .map((link) => link.href);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer() {
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      const response = await fetch(ORIGIN, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      /** Still booting. */
    }

    await sleep(1_000);
  }

  throw new Error("the recorder's dev server never came up");
}

/**
 * Guest posts and product pages are only reachable by name, and the specs open
 * whichever one happens to be first, so every link the two archives publish
 * gets recorded rather than a hand-picked few.
 */
async function linksFrom(path: string, pattern: RegExp) {
  const html = await (await fetch(`${ORIGIN}${path}`)).text();
  const hrefs: string[] = [];
  const anchors = /href="(\/[^"]*)"/g;
  let match = anchors.exec(html);

  while (match) {
    if (pattern.test(match[1]) && hrefs.indexOf(match[1]) === -1) hrefs.push(match[1]);
    match = anchors.exec(html);
  }

  return hrefs;
}

async function recordReads() {
  const seeds = EXTRA_ROUTES.concat(navRoutes).filter(
    (route, index, all) => all.indexOf(route) === index,
  );

  for (const route of seeds) {
    process.stdout.write(`  ${route}\n`);
    await fetch(`${ORIGIN}${route}`, { redirect: "manual" });
  }

  const followed = (await linksFrom("/goscie/", /^\/\d{4}\/\d{2}\/\d{2}\//)).concat(
    await linksFrom("/sklep/", /^\/produkt\//),
  );

  for (const route of followed) {
    process.stdout.write(`  ${route}\n`);
    await fetch(`${ORIGIN}${route}`, { redirect: "manual" });
  }
}

type WooReply = { data?: any; errors?: { message: string }[] };

let session = "";

async function woo(query: string, variables: { [key: string]: unknown }): Promise<WooReply> {
  const response = await fetch(GRAPHQL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(session && { "woocommerce-session": `Session ${session}` }),
    },
    body: JSON.stringify({ query, variables }),
  });

  const refreshed = response.headers.get("woocommerce-session");
  if (refreshed) session = refreshed;

  const body = (await response.json()) as WooReply;

  if (body.errors?.length) throw new Error(body.errors.map((e) => e.message).join("; "));

  return body;
}

/**
 * Reads the variation the specs buy out of the fixture the read pass just
 * saved, so the two halves cannot drift apart.
 */
async function variationToBuy() {
  const { ProductVariationsQuery } = await import("../src/queries/cart/ProductVariationsQuery");
  const { ProductQuery } = await import("../src/queries/general/ProductQuery");

  const product = await woo(print(ProductQuery), { preview: false, slugs: [CART_PRODUCT.slug] });
  const node = product.data?.products?.nodes?.[0];

  const variations = await woo(print(ProductVariationsQuery), { slugs: [CART_PRODUCT.slug] });
  const all = variations.data?.products?.nodes?.[0]?.variations?.nodes ?? [];

  const chosen = all.filter((variation: any) =>
    (variation.attributes?.nodes ?? []).some(
      (attribute: any) =>
        attribute.name === CART_PRODUCT.attribute && attribute.value === CART_PRODUCT.option,
    ),
  )[0];

  if (!node?.databaseId || !chosen?.databaseId) {
    throw new Error(`${CART_PRODUCT.slug} no longer offers ${CART_PRODUCT.option}`);
  }

  return { productId: node.databaseId as number, variationId: chosen.databaseId as number };
}

async function recordCart() {
  const { productId, variationId } = await variationToBuy();
  const snapshots: CartSnapshots = { ...readSnapshots(), carts: {} };
  const key = (quantity: number) => `${productId}:${variationId}:${quantity}`;

  const added = await woo(print(AddToCartMutation), {
    input: {
      productId,
      variationId,
      quantity: 1,
      variation: [
        { attributeName: CART_PRODUCT.attribute, attributeValue: CART_PRODUCT.option },
      ],
    },
  });

  snapshots.carts[key(1)] = added.data.addToCart.cart;

  const itemKey = added.data.addToCart.cart.contents.nodes[0].key as string;

  for (const quantity of [2, 3]) {
    const updated = await woo(print(UpdateItemQuantitiesMutation), {
      input: { items: [{ key: itemKey, quantity }] },
    });

    snapshots.carts[key(quantity)] = updated.data.updateItemQuantities.cart;
  }

  const checkout = await woo(print(CheckoutUrlQuery), {});
  snapshots.checkoutUrl = checkout.data?.customer?.checkoutUrl ?? null;

  const emptied = await woo(print(RemoveItemsFromCartMutation), { input: { keys: [itemKey] } });
  snapshots.empty = emptied.data.removeItemsFromCart.cart;

  /** Prove the session really is empty before walking away from it. */
  const confirmed = await woo(print(CartQuery), {});
  snapshots.empty = confirmed.data.cart;

  writeSnapshots(snapshots);

  console.log(`  cart snapshots for product ${productId}, variation ${variationId}`);
  console.log(`  checkoutUrl: ${snapshots.checkoutUrl ?? "null (the till is closed)"}`);
}

async function main() {
  if (!process.env.NEXT_PUBLIC_WORDPRESS_API_URL) {
    throw new Error("NEXT_PUBLIC_WORDPRESS_API_URL is unset — run `vercel env pull .env.local`");
  }

  /** Next's dev fetch cache would answer the crawl instead of WordPress. */
  rmSync(join(process.cwd(), DIST_DIR, "cache", "fetch-cache"), { recursive: true, force: true });

  console.log(`recording from ${process.env.NEXT_PUBLIC_WORDPRESS_API_URL} — this is slow`);

  const server = spawn("bun", ["run", "next", "dev", "--port", String(PORT)], {
    env: { ...process.env, MOCK_WP: "record", NEXT_DIST_DIR: DIST_DIR },
    stdio: ["ignore", "ignore", "inherit"],
  });

  try {
    await waitForServer();
    await recordReads();
  } finally {
    server.kill("SIGTERM");
  }

  if (process.argv.indexOf("--cart") !== -1) {
    console.log("opening one guest cart on the live shop — no order is created");
    await recordCart();
  }

  console.log("done — review `git diff e2e/fixtures/wp` before committing");
}

void main().then(
  () => process.exit(0),
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
