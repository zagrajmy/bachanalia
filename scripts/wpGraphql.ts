import type { TypedDocumentString } from "../src/gql/graphql";
import {
  type GraphQLResponse,
  graphqlUrl,
  isTransient,
  RETRY_DELAYS_MS,
  type VariablesArg,
} from "../src/utils/graphqlRequest";
import { sleep } from "../src/utils/sleep";

const WP = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? "https://bachanaliafantastyczne.pl";

/**
 * A build has no reader waiting on it, and the host answers a burst with a
 * minute or two of 503s, so it waits far longer than a request would.
 */
const DELAYS_MS = [...RETRY_DELAYS_MS, 60_000, 60_000, 60_000];

export async function wpQuery<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  ...[variables]: VariablesArg<TVariables>
): Promise<TResult> {
  const url = graphqlUrl(WP, document, variables ?? {});

  let lastError: unknown;

  for (let attempt = 0; attempt <= DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(DELAYS_MS[attempt - 1] ?? 0);

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
      lastError = new Error(`GraphQL: unparseable response from ${WP}`);
      continue;
    }

    if (body.errors?.length) {
      throw new Error(body.errors.map((error) => error.message).join("; "));
    }

    if (body.data === undefined) {
      lastError = new Error(`GraphQL: no data in the response from ${WP}`);
      continue;
    }

    return body.data;
  }

  throw lastError;
}
