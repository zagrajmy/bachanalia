import { cookies, draftMode } from "next/headers";

import type { TypedDocumentString } from "@/gql/graphql";

type Variables = Record<string, unknown>;

/**
 * What the endpoint answers with. The payload's shape is the document's to
 * promise — codegen wrote the query against the schema WordPress serves — so
 * it is named here rather than checked again on every request.
 */
export type GraphQLResponse<TResult> = {
  data?: TResult;
  errors?: { message?: string }[];
};

/** Queries that take none are generated as `Exact<{ [key: string]: never }>`. */
export type VariablesArg<TVariables> =
  Record<string, never> extends TVariables ? [variables?: TVariables] : [variables: TVariables];

type CacheInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

/**
 * Queries go over GET. Wordfence's firewall inspects POST bodies and rejects
 * GraphQL connection syntax ("a potentially unsafe operation"), which silently
 * breaks list queries, and POST is never cacheable anyway.
 */
function endpoint(query: string, variables: Variables) {
  const url = new URL(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/graphql`);
  url.searchParams.set("query", query);

  if (Object.keys(variables).length > 0) {
    url.searchParams.set("variables", JSON.stringify(variables));
  }

  return url.toString();
}

/**
 * Wordfence does not throttle a request, it throttles the client: once a
 * prerender's burst trips it, everything hangs for tens of seconds and then
 * recovers on its own. Backing off well past that is the difference between
 * a slow build and a failed one, so the tail is deliberately long.
 */
const RETRY_DELAYS_MS = [500, 2000, 6000, 15_000, 30_000];

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * Wordfence rate-limits bursts, and a prerender walks every page at once, so a
 * single refusal would otherwise fail the whole build.
 */
const isTransient = (status: number) => status === 403 || status === 429 || status >= 500;

/**
 * Deliberately no per-attempt timeout. Under a prerender's concurrency this
 * server answers in ~10s rather than its usual ~1s, so a timeout aborts
 * requests that were about to succeed and each retry adds to the pile it is
 * already struggling with. A genuinely hung socket is caught instead by
 * staticPageGenerationTimeout, and Next retries that page three times —
 * whereas a thrown error ends the build on the spot.
 */
async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);

    try {
      const response = await fetch(url, init);
      if (!isTransient(response.status)) return response;
      lastError = new Error(`WordPress responded ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function request<T>(
  query: string,
  variables: Variables,
  headers: Record<string, string>,
  init: CacheInit,
): Promise<T> {
  const response = await fetchWithRetry(endpoint(query, variables), { headers, ...init });

  if (!response.ok) {
    throw new Error(`WordPress responded ${response.status} ${response.statusText}`);
  }

  const body = (await response.json()) as GraphQLResponse<T>;

  if (body.errors?.length) {
    throw new Error(`GraphQL error: ${body.errors.map((error) => error.message).join("; ")}`);
  }

  if (body.data === undefined) {
    throw new Error("WordPress answered with neither data nor errors");
  }

  return body.data;
}

export async function fetchGraphQL<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: VariablesArg<TVariables>
): Promise<TResult> {
  const { isEnabled: preview } = await draftMode();
  const auth = preview ? (await cookies()).get("wp_jwt")?.value : undefined;

  return request<TResult>(
    String(query),
    { preview, ...variables },
    auth ? { Authorization: `Bearer ${auth}` } : {},
    preview ? { cache: "no-store" } : { next: { tags: ["wordpress"], revalidate: 10_800 } },
  );
}

export async function fetchGraphQLAtBuild<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: VariablesArg<TVariables>
): Promise<TResult> {
  return request<TResult>(
    String(query),
    { preview: false, ...variables },
    {},
    { cache: "no-store" },
  );
}
