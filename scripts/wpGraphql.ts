import type { TypedDocumentString } from "../src/gql/graphql";
import type { GraphQLResponse, VariablesArg } from "../src/utils/fetchGraphQL";
import { sleep } from "../src/utils/sleep";

const WP = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? "https://bachanaliafantastyczne.pl";

/**
 * `fetchGraphQL`'s ladder, and the same reason: Wordfence throttles the
 * client, not the request, and recovers on its own if the backoff outlasts it.
 */
const RETRY_DELAYS_MS = [500, 2000, 6000, 15_000, 30_000];

const isTransient = (status: number) => status === 403 || status === 429 || status >= 500;

export async function wpQuery<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: VariablesArg<TVariables>
): Promise<TResult> {
  const params = variables ?? {};
  const url = new URL(`${WP}/graphql`);
  url.searchParams.set("query", String(document));
  if (Object.keys(params).length > 0) {
    url.searchParams.set("variables", JSON.stringify(params));
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 0);

    let response: Response;

    try {
      response = await fetch(url);
    } catch (error) {
      lastError = error;
      continue;
    }

    if (isTransient(response.status)) {
      lastError = new Error(`GraphQL ${response.status} ${response.statusText}`);
      continue;
    }

    if (!response.ok) throw new Error(`GraphQL ${response.status} ${response.statusText}`);

    /**
     * The firewall answers an automated client's burst with an HTML challenge
     * under a 200. Every query here is a read, so replaying is safe.
     */
    let body: GraphQLResponse<TResult>;

    try {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the payload's shape is the document's to promise
      body = (await response.json()) as GraphQLResponse<TResult>;
    } catch {
      lastError = new Error(`GraphQL: unparseable response from ${url.pathname}`);
      continue;
    }

    if (body.errors?.length) {
      throw new Error(body.errors.map((error) => error.message).join("; "));
    }

    if (body.data === undefined) {
      lastError = new Error(`GraphQL: no data in the response from ${url.pathname}`);
      continue;
    }

    return body.data;
  }

  throw lastError;
}
