import { draftMode, cookies } from "next/headers";

type Variables = { [key: string]: any };

type CacheInit = RequestInit & { next?: { tags?: string[]; revalidate?: number } };

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

const RETRY_DELAYS_MS = [400, 1200, 3000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wordfence rate-limits bursts, and a prerender walks every page at once, so a
 * single refusal would otherwise fail the whole build.
 */
const isTransient = (status: number) => status === 403 || status === 429 || status >= 500;

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
  headers: { [key: string]: string },
  init: CacheInit,
): Promise<T> {
  const response = await fetchWithRetry(endpoint(query, variables), { headers, ...init });

  if (!response.ok) {
    throw new Error(`WordPress responded ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL error: ${data.errors.map((e: any) => e.message).join("; ")}`);
  }

  return data.data;
}

export async function fetchGraphQL<T = any>(
  query: string,
  variables?: Variables,
  headers?: { [key: string]: string },
): Promise<T> {
  const { isEnabled: preview } = await draftMode();
  const auth = preview ? (await cookies()).get("wp_jwt")?.value : undefined;

  return request<T>(
    query,
    { preview, ...variables },
    { ...(auth && { Authorization: `Bearer ${auth}` }), ...headers },
    preview ? { cache: "no-store" } : { next: { tags: ["wordpress"], revalidate: 3600 } },
  );
}

export async function fetchGraphQLAtBuild<T = any>(
  query: string,
  variables?: Variables,
): Promise<T> {
  return request<T>(query, { preview: false, ...variables }, {}, { cache: "no-store" });
}
