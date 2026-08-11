import { type } from "arktype";
import { cookies } from "next/headers";

import type { TypedDocumentString } from "@/gql/graphql";
import type { GraphQLResponse } from "@/utils/fetchGraphQL";

import { wooMessage } from "./message";
import { sleep } from "@/utils/sleep";

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

/** Whatever else WooCommerce stamps into the token, the expiry is the part read here. */
const JwtClaims = type({ "exp?": "number" });

/**
 * WooCommerce stamps its own expiry into the token — currently 48 hours — so
 * the cookie is dropped exactly when the cart behind it dies rather than
 * lingering as a token the server will refuse.
 */
function maxAgeOf(token: string) {
  const payload = token.split(".")[1];

  if (payload) {
    try {
      const claims = JwtClaims(JSON.parse(Buffer.from(payload, "base64").toString("utf8")));
      if (claims instanceof type.errors || claims.exp === undefined) return FALLBACK_MAX_AGE;

      const seconds = Math.floor(claims.exp - Date.now() / 1000);
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
  | { ok: false; indeterminate: boolean; message: string }
  | { ok: true; data: T };

/**
 * How much a failed attempt may be repeated.
 *
 * - `read` — nothing was written, so replay it the way the content queries do.
 * - `replayable` — retry only the statuses that mean a firewall refused the
 *   request before WooCommerce saw it. A 5xx can arrive *after* a mutation
 *   applied, and a retried `addToCart` silently doubles the line.
 * - `once` — checkout. A retry here is a second order and a second charge.
 */
export type RetryPolicy = "once" | "read" | "replayable";

/**
 * Shorter than `fetchGraphQL`'s ladder because a person is watching this one,
 * not a prerender. Still no per-attempt timeout: this server answers in ~10s
 * under load and aborting a request that was about to succeed only adds to
 * the pile.
 */
const RETRY_DELAYS_MS = [400, 1200, 3000];

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
 * Cart traffic goes over POST with the session header. Wordfence inspects
 * POST bodies but does not block these — proven by order 3502 — and POST is
 * the only shape a mutation has anyway.
 */
export async function wooRequest<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
  policy: RetryPolicy,
): Promise<WooResult<TResult>> {
  const query = String(document);
  const token = await readSession();
  const retries = retriesFor(policy);

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 0);

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
      /**
       * A socket that died mid-flight says nothing about whether WooCommerce
       * applied the mutation, so only a read may be replayed — retrying an
       * `addToCart` here is how a line silently doubles.
       */
      if (policy === "read") continue;

      return { ok: false, message: GENERIC_FAILURE, indeterminate: true };
    }

    if (!response.ok) {
      if (mayRetry(policy, response.status)) continue;

      return {
        ok: false,
        message: GENERIC_FAILURE,
        indeterminate: response.status >= 500 && policy !== "read",
      };
    }

    const refreshed = response.headers.get(SESSION_HEADER);
    if (refreshed) await writeSession(refreshed);

    /**
     * Cloudflare answers automated clients with an HTML challenge under a 200,
     * and a parse error thrown from here reaches the buyer as an error
     * boundary instead of the deliberate "do not submit twice" message.
     */
    let body: GraphQLResponse<TResult>;

    try {
      body = (await response.json()) as GraphQLResponse<TResult>;
    } catch {
      return { ok: false, message: GENERIC_FAILURE, indeterminate: policy !== "read" };
    }

    if (body.errors?.length) {
      return {
        ok: false,
        message: wooMessage(String(body.errors[0]?.message)),
        indeterminate: false,
      };
    }

    if (body.data === undefined) {
      return { ok: false, message: GENERIC_FAILURE, indeterminate: policy !== "read" };
    }

    return { ok: true, data: body.data };
  }

  /**
   * Every attempt that reached here was refused by the firewall before
   * WooCommerce saw the request, so nothing was written.
   */
  return { ok: false, message: GENERIC_FAILURE, indeterminate: false };
}
