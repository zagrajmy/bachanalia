import { bypass, http, HttpResponse, passthrough } from "msw";

import { addLine, cartOf, cartResponse, removeLines, setLineQuantity } from "./cart";
import { readFixture, readSnapshots, writeFixture } from "./fixtures";

export type Mode = "replay" | "record";

const SESSION_HEADER = "woocommerce-session";

/**
 * A 1×1 PNG. Every WordPress upload answers with this: the specs check that
 * photos go through `/_next/image` and that a gallery lays out in columns, and
 * neither needs the multi-megabyte original — which is also the traffic that
 * makes a live run slow enough to trip Cloudflare.
 */
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

function wordpressHost() {
  try {
    return new URL(String(process.env.NEXT_PUBLIC_WORDPRESS_API_URL)).host;
  } catch {
    return "";
  }
}

const isWordPress = (url: URL) => url.host === wordpressHost();

/** Facebook's signed CDN URLs, which `fetchFacebookNews` HEADs before rendering. */
const isFacebookCdn = (url: URL) => /(^|\.)fbcdn\.net$/.test(url.hostname);

const isGraphQL = (url: URL) => /\/graphql\/?$/.test(url.pathname);

/** `fragment` definitions never match, so the first hit is the operation. */
function operationNameOf(query: string) {
  const match = /\b(?:query|mutation)\s+([A-Za-z0-9_]+)/.exec(query);

  return match ? match[1] : "";
}

/**
 * The stateful half. `CheckoutUrlQuery` is deliberately not here: it depends on
 * two WordPress settings rather than on the cart, so it replays whatever the
 * shop actually answered — today, that the field does not exist at all.
 */
const CART_OPERATIONS = [
  "CartQuery",
  "AddToCartMutation",
  "UpdateItemQuantitiesMutation",
  "RemoveItemsFromCartMutation",
];

/**
 * WooCommerce's session is a JWT and `session.ts` reads its `exp` to decide how
 * long to keep the cookie, so the mock has to mint the same shape. It is also
 * what isolates one browser context's cart from another's, which is what lets
 * the suite run at `--workers=2` against a single server.
 */
let issued = 0;

function mintToken() {
  issued += 1;

  const claims = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 172_800, id: issued }),
  ).toString("base64");

  return `mock.${claims}.signature`;
}

function tokenOf(request: Request) {
  const header = request.headers.get(SESSION_HEADER);

  return header ? header.replace(/^Session\s+/, "") : "";
}

type Operation = { name: string; query: string; variables: { [key: string]: any } };

async function readOperation(request: Request): Promise<Operation> {
  const url = new URL(request.url);

  if (request.method === "GET") {
    const query = url.searchParams.get("query") ?? "";
    const raw = url.searchParams.get("variables");

    return { name: operationNameOf(query), query, variables: raw ? JSON.parse(raw) : {} };
  }

  const body = (await request.clone().json()) as { query?: string; variables?: unknown };
  const query = body.query ?? "";

  return {
    name: operationNameOf(query),
    query,
    variables: (body.variables as { [key: string]: any }) ?? {},
  };
}

function cartReply(request: Request, operation: Operation) {
  const existing = tokenOf(request);
  const token = existing || mintToken();
  const input = (operation.variables.input ?? {}) as { [key: string]: any };

  switch (operation.name) {
    case "CheckoutUrlQuery":
      return {
        headers: token,
        body: { data: { customer: { checkoutUrl: readSnapshots().checkoutUrl ?? null } } },
      };

    case "AddToCartMutation":
      addLine(
        token,
        Number(input.productId),
        Number(input.variationId ?? 0),
        Math.max(Number(input.quantity) || 1, 1),
      );

      return { headers: token, body: { data: { addToCart: { cart: cartResponse(token) } } } };

    case "UpdateItemQuantitiesMutation":
      for (const item of (input.items ?? []) as { key: string; quantity: number }[]) {
        setLineQuantity(token, item.key, Number(item.quantity));
      }

      return {
        headers: token,
        body: { data: { updateItemQuantities: { cart: cartResponse(token) } } },
      };

    case "RemoveItemsFromCartMutation":
      removeLines(token, (input.keys ?? []) as string[]);

      return {
        headers: token,
        body: { data: { removeItemsFromCart: { cart: cartResponse(token) } } },
      };

    default:
      /** `CartQuery`. An unknown token is a cart the server forgot: empty. */
      void cartOf(token);

      return { headers: token, body: { data: { cart: cartResponse(token) } } };
  }
}

async function record(request: Request, operation: Operation) {
  const response = await fetch(bypass(request));
  const text = await response.text();

  if (response.ok) {
    try {
      writeFixture(operation.name, operation.variables, JSON.parse(text));
    } catch {
      console.error(`[mock-wp] ${operation.name} did not answer JSON; not recorded`);
    }
  }

  return new HttpResponse(text, {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}

function replay(request: Request, operation: Operation) {
  if (CART_OPERATIONS.indexOf(operation.name) !== -1) {
    const { headers, body } = cartReply(request, operation);

    return HttpResponse.json(body, { headers: { [SESSION_HEADER]: headers } });
  }

  const fixture = readFixture(operation.name, operation.variables);

  if (fixture === undefined) {
    console.error(
      `[mock-wp] no fixture for ${operation.name} ${JSON.stringify(operation.variables)}`,
    );

    /**
     * 400 rather than 500: `fetchGraphQL` treats 5xx as the rate limiter and
     * spends a minute backing off before it admits anything is wrong.
     */
    return HttpResponse.json({ errors: [{ message: `No fixture for ${operation.name}` }] }, {
      status: 400,
    });
  }

  return HttpResponse.json(fixture);
}

export function handlersFor(mode: Mode) {
  return [
    http.all("*", async ({ request }) => {
      const url = new URL(request.url);

      if (isFacebookCdn(url)) {
        return new HttpResponse(request.method === "HEAD" ? null : PIXEL, {
          headers: { "content-type": "image/jpeg" },
        });
      }

      if (!isWordPress(url)) return passthrough();

      if (!isGraphQL(url)) {
        if (mode === "record") return passthrough();

        return new HttpResponse(PIXEL, { headers: { "content-type": "image/png" } });
      }

      const operation = await readOperation(request);

      if (!operation.name) {
        console.error("[mock-wp] a GraphQL request carried no named operation");

        return HttpResponse.json({ errors: [{ message: "Unnamed operation" }] }, { status: 400 });
      }

      return mode === "record" ? record(request, operation) : replay(request, operation);
    }),
  ];
}
