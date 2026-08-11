import type { TypedDocumentString } from "@/gql/graphql";

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

/**
 * Queries go over GET. Wordfence's firewall inspects POST bodies and rejects
 * GraphQL connection syntax ("a potentially unsafe operation"), which silently
 * breaks list queries, and POST is never cacheable anyway.
 */
export function graphqlUrl<TResult, TVariables>(
  base: string | undefined,
  document: TypedDocumentString<TResult, TVariables>,
  variables: Record<string, unknown>,
) {
  const url = new URL(`${base}/graphql`);
  url.searchParams.set("query", String(document));

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
export const RETRY_DELAYS_MS = [500, 2000, 6000, 15_000, 30_000];

/**
 * Wordfence rate-limits bursts, and a prerender walks every page at once, so a
 * single refusal would otherwise fail the whole build.
 */
export const isTransient = (status: number) => status === 403 || status === 429 || status >= 500;
