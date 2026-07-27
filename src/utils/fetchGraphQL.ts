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

async function request<T>(
  query: string,
  variables: Variables,
  headers: { [key: string]: string },
  init: CacheInit,
): Promise<T> {
  const response = await fetch(endpoint(query, variables), { headers, ...init });

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
