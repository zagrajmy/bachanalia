import { cookies, draftMode } from "next/headers";

import type { TypedDocumentString } from "@/gql/graphql";
import {
  type GraphQLResponse,
  graphqlUrl,
  isTransient,
  RETRY_DELAYS_MS,
  type VariablesArg,
} from "@/utils/graphqlRequest";
import { sleep } from "@/utils/sleep";

type Variables = Record<string, unknown>;

type CacheInit = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

/**
 * Deliberately no per-attempt timeout. Under a prerender's concurrency this
 * server answers in ~10s rather than its usual ~1s, so a timeout aborts
 * requests that were about to succeed and each retry adds to the pile it is
 * already struggling with. A genuinely hung socket is caught instead by
 * staticPageGenerationTimeout, and Next retries that page three times —
 * whereas a thrown error ends the build on the spot.
 */
async function fetchWithRetry<TResult>(
  url: string,
  init: RequestInit,
): Promise<GraphQLResponse<TResult>> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 0);

    let response: Response;

    try {
      response = await fetch(url, init);
    } catch (error) {
      lastError = error;
      continue;
    }

    if (isTransient(response.status)) {
      lastError = new Error(`WordPress responded ${response.status}`);
      continue;
    }

    if (!response.ok) {
      throw new Error(`WordPress responded ${response.status} ${response.statusText}`);
    }

    /**
     * The body is read inside the loop: this host drops the connection
     * mid-response often enough that a socket dying after the headers arrived
     * is just another transient failure, as is the firewall's HTML challenge
     * served under a 200.
     */
    try {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the payload's shape is the document's to promise
      return (await response.json()) as GraphQLResponse<TResult>;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function request<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables: Variables,
  headers: Record<string, string>,
  init: CacheInit,
): Promise<TResult> {
  const body = await fetchWithRetry<TResult>(
    graphqlUrl(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, query, variables),
    { headers, ...init },
  );

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

  return request(
    query,
    { preview, ...variables },
    auth ? { Authorization: `Bearer ${auth}` } : {},
    preview ? { cache: "no-store" } : { next: { tags: ["wordpress"], revalidate: 10_800 } },
  );
}

export async function fetchGraphQLAtBuild<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: VariablesArg<TVariables>
): Promise<TResult> {
  return request(query, { preview: false, ...variables }, {}, { cache: "no-store" });
}
