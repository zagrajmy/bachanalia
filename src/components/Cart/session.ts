import { cookies } from "next/headers";

/**
 * The WooCommerce session is a JWT, and a JWT is a bearer credential: whoever
 * holds it owns that cart and the billing address typed into it. It lives in
 * an httpOnly cookie, never in client JavaScript, never in a URL, and never
 * in anything cached — which is why this transport is separate from
 * `fetchGraphQL` rather than a flag on it.
 */
export const SESSION_COOKIE = "bf_wc_session";

const SESSION_HEADER = "woocommerce-session";

const FALLBACK_MAX_AGE = 2 * 24 * 60 * 60;

/**
 * WooCommerce stamps its own expiry into the token — currently 48 hours — so
 * the cookie is dropped exactly when the cart behind it dies rather than
 * lingering as a token the server will refuse.
 */
function maxAgeOf(token: string) {
  const payload = token.split(".")[1];

  if (payload) {
    try {
      const claims = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
      const seconds = Math.floor(Number(claims.exp) - Date.now() / 1000);
      if (seconds > 60) return seconds;
    } catch {
      return FALLBACK_MAX_AGE;
    }
  }

  return FALLBACK_MAX_AGE;
}

export async function readSession() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/**
 * Only a Server Action or a Route Handler may write a cookie; a Server
 * Component render throws. Reads still get a refreshed token back from
 * WooCommerce, and dropping it there is harmless — the one we already hold
 * stays valid.
 */
export async function writeSession(token: string) {
  const store = await cookies();

  try {
    store.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: maxAgeOf(token),
    });
  } catch {
    return false;
  }

  return true;
}

export type WooResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; indeterminate: boolean };

/**
 * How much a failed attempt may be repeated.
 *
 * - `read` — nothing was written, so replay it the way the content queries do.
 * - `replayable` — retry only the statuses that mean a firewall refused the
 *   request before WooCommerce saw it. A 5xx can arrive *after* a mutation
 *   applied, and a retried `addToCart` silently doubles the line.
 * - `once` — checkout. A retry here is a second order and a second charge.
 */
export type RetryPolicy = "read" | "replayable" | "once";

/**
 * Shorter than `fetchGraphQL`'s ladder because a person is watching this one,
 * not a prerender. Still no per-attempt timeout: this server answers in ~10s
 * under load and aborting a request that was about to succeed only adds to
 * the pile.
 */
const RETRY_DELAYS_MS = [400, 1_200, 3_000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isFirewallRefusal = (status: number) => status === 403 || status === 429;

function retriesFor(policy: RetryPolicy) {
  return policy === "once" ? 0 : RETRY_DELAYS_MS.length;
}

function mayRetry(policy: RetryPolicy, status: number) {
  if (policy === "once") return false;
  if (isFirewallRefusal(status)) return true;

  return policy === "read" && status >= 500;
}

const GENERIC_FAILURE = "Nie udało się połączyć ze sklepem. Spróbuj ponownie za chwilę.";

/**
 * WooCommerce answers an empty cart at checkout with its session error, which
 * says nothing a buyer can act on.
 */
const TRANSLATIONS: { [message: string]: string } = {
  "Sorry, no session found.": "Koszyk jest pusty.",
  "Invalid payment method.": "Ta metoda płatności jest niedostępna.",
};

const translate = (message: string) => TRANSLATIONS[message] ?? message;

/**
 * Cart traffic goes over POST with the session header. Wordfence inspects
 * POST bodies but does not block these — proven by order 3502 — and POST is
 * the only shape a mutation has anyway.
 */
export async function wooRequest<T>(
  query: string,
  variables: { [key: string]: unknown },
  policy: RetryPolicy,
): Promise<WooResult<T>> {
  const token = await readSession();
  const retries = retriesFor(policy);
  let indeterminate = false;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);

    let response: Response;

    try {
      response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/graphql`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          ...(token && { [SESSION_HEADER]: `Session ${token}` }),
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch {
      indeterminate = policy !== "read";
      continue;
    }

    if (!response.ok) {
      if (mayRetry(policy, response.status)) continue;
      if (response.status >= 500) indeterminate = policy !== "read";

      return { ok: false, message: GENERIC_FAILURE, indeterminate };
    }

    const refreshed = response.headers.get(SESSION_HEADER);
    if (refreshed) await writeSession(refreshed);

    const body = await response.json();

    if (body.errors?.length) {
      return {
        ok: false,
        message: translate(String(body.errors[0].message)),
        indeterminate: false,
      };
    }

    return { ok: true, data: body.data as T };
  }

  return { ok: false, message: GENERIC_FAILURE, indeterminate };
}
