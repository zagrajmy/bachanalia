import { bypass, http, HttpResponse, passthrough } from "msw";

import { addLine, cartResponse, removeLines, setLineQuantity } from "./cart";
import { readFixture, writeFixture } from "./fixtures";

export type Mode = "record" | "replay";

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

/**
 * WordPress served the apex until the cutover, and every image an editor
 * placed in a page body before then still carries that hostname — no env var
 * names it any more, so without this those uploads would be fetched for real.
 */
const LEGACY_HOST = "bachanaliafantastyczne.pl";

/**
 * All of them, because the uploads a fixture points at keep the real hostname
 * even when the API URL is aimed at somewhere unroutable to prove the suite
 * never opens a socket.
 */
function wordpressHosts() {
  const hosts: string[] = [LEGACY_HOST];

  try {
    hosts.push(new URL(String(process.env.NEXT_PUBLIC_WORDPRESS_API_URL)).host);
  } catch {
    /** Unset or malformed; the hostname below may still match. */
  }

  if (process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME) {
    hosts.push(process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME);
  }

  return hosts;
}

const isWordPress = (url: URL) => wordpressHosts().includes(url.host);

/** Facebook's signed CDN URLs, which `fetchFacebookNews` HEADs before rendering. */
const isFacebookCdn = (url: URL) => /(^|\.)fbcdn\.net$/.test(url.hostname);

const isGraphQL = (url: URL) => /\/graphql\/?$/.test(url.pathname);

/** `fragment` definitions never match, so the first hit is the operation. */
function operationNameOf(query: string) {
  const match = /\b(?:query|mutation)\s+([A-Za-z0-9_]+)/.exec(query);

  return match?.[1] ?? "";
}

/**
 * The stateful half. `CheckoutUrlQuery` is deliberately not here: it depends on
 * two WordPress settings rather than on the cart, so it replays a fixture. The
 * nonce in that fixture is a stand-in — a real one is bound to one session and
 * expires, so recording it would save something dead.
 */
const CART_OPERATIONS = new Set([
  "AddToCartMutation",
  "CartQuery",
  "RemoveItemsFromCartMutation",
  "UpdateItemQuantitiesMutation",
]);

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

type Operation = { name: string; query: string; variables: Record<string, unknown> };

async function readOperation(request: Request): Promise<Operation> {
  const url = new URL(request.url);

  if (request.method === "GET") {
    const query = url.searchParams.get("query") ?? "";
    const raw = url.searchParams.get("variables");

    return {
      name: operationNameOf(query),
      query,
      variables: raw ? (JSON.parse(raw) as Record<string, unknown>) : {},
    };
  }

  const body = (await request.clone().json()) as { query?: string; variables?: unknown };
  const query = body.query ?? "";

  return {
    name: operationNameOf(query),
    query,
    variables: (body.variables as Record<string, unknown> | undefined) ?? {},
  };
}

function cartReply(request: Request, operation: Operation) {
  const existing = tokenOf(request);
  const token = existing || mintToken();
  const input = (operation.variables.input ?? {}) as Record<string, unknown>;

  switch (operation.name) {
    case "AddToCartMutation":
      addLine(
        token,
        Number(input.productId),
        Number(input.variationId ?? 0),
        Math.max(Number(input.quantity) || 1, 1),
      );

      return { headers: token, body: { data: { addToCart: { cart: cartResponse(token) } } } };

    case "RemoveItemsFromCartMutation":
      removeLines(token, (input.keys ?? []) as string[]);

      return {
        headers: token,
        body: { data: { removeItemsFromCart: { cart: cartResponse(token) } } },
      };

    case "UpdateItemQuantitiesMutation":
      /** Whatever the client sent — the quantity is not a number until it is made one. */
      for (const item of (input.items ?? []) as { key: string; quantity: unknown }[]) {
        setLineQuantity(token, item.key, Number(item.quantity));
      }

      return {
        headers: token,
        body: { data: { updateItemQuantities: { cart: cartResponse(token) } } },
      };

    default:
      /** `CartQuery`. An unknown token is a cart the server forgot: empty. */
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
  if (CART_OPERATIONS.has(operation.name)) {
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
    return HttpResponse.json(
      { errors: [{ message: `No fixture for ${operation.name}` }] },
      {
        status: 400,
      },
    );
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
