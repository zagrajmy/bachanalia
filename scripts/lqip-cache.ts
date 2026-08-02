import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { print } from "graphql/language/printer";
import gql from "graphql-tag";

import { parseFeedItems } from "../src/components/News/facebookFeed";
import { NewsQuery } from "../src/components/News/NewsQuery";
import { AllContentQuery } from "../src/queries/general/AllContentQuery";
import { ContentQuery } from "../src/queries/general/ContentQuery";
import { ProductsQuery } from "../src/queries/general/ProductsQuery";
import { fbPostKey, wpMediaKey } from "../src/utils/lqip";
import { fetchLqip } from "../src/utils/lqipEncode";
import { splitWpContent } from "../src/utils/prepareWpContent";

const ROOT = join(import.meta.dir, "..");
const CACHE_PATH = join(ROOT, "src/content/lqip-cache.json");
const WP = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? "https://bachanaliafantastyczne.pl";
const DELAY_MS = 350;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Cache = { [key: string]: string };
type Job = { key: string; fetchUrl: string };

async function graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${WP}/graphql`);
  url.searchParams.set("query", query);
  if (Object.keys(variables).length > 0) {
    url.searchParams.set("variables", JSON.stringify(variables));
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error(`GraphQL ${response.status} ${response.statusText}`);
  const body = await response.json();
  if (body.errors) {
    throw new Error(body.errors.map((error: { message: string }) => error.message).join("; "));
  }
  return body.data;
}

function thumbUrl(src: string) {
  try {
    const url = new URL(src);
    if (!url.pathname.includes("/wp-content/uploads/")) return src;
    if (/-\d+x\d+\.[^.]+$/.test(url.pathname)) {
      url.pathname = url.pathname.replace(/-\d+x\d+(?=\.[^.]+$)/, "-150x150");
      return url.toString();
    }
    url.pathname = url.pathname.replace(/(\.[^.]+)$/, "-150x150$1");
    return url.toString();
  } catch {
    return src;
  }
}

async function encode(fetchUrl: string, displaySrc: string) {
  const primary = await fetchLqip(fetchUrl);
  if (primary) return primary;
  if (fetchUrl === displaySrc) return undefined;
  return fetchLqip(displaySrc);
}

async function loadCache(): Promise<Cache> {
  try {
    return JSON.parse(await readFile(CACHE_PATH, "utf8")) as Cache;
  } catch {
    return {};
  }
}

async function collectJobs(): Promise<Job[]> {
  const jobs: Job[] = [];
  const seen = new Set<string>();

  const add = (key: string, fetchUrl: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    jobs.push({ key, fetchUrl });
  };

  const news = await graphql<{
    posts: {
      nodes: {
        featuredImage?: {
          node?: { sourceUrl?: string | null; thumbnail?: string | null } | null;
        } | null;
      }[];
    };
  }>(print(NewsQuery), { first: 50 });

  for (const post of news.posts?.nodes ?? []) {
    const image = post.featuredImage?.node;
    if (!image?.sourceUrl) continue;
    add(wpMediaKey(image.sourceUrl), image.thumbnail || thumbUrl(image.sourceUrl));
  }

  const { nodeByUri } = await graphql<{
    nodeByUri: { content?: string | null } | null;
  }>(
    print(gql`
      query FeedQuery($uri: String!) {
        nodeByUri(uri: $uri) {
          ... on Page {
            content
          }
        }
      }
    `),
    { uri: "/" },
  );

  for (const entry of parseFeedItems(nodeByUri?.content ?? "")) {
    if (!entry.image?.src) continue;
    add(fbPostKey(entry.id), entry.image.src);
  }

  const shop = await graphql<{
    products: {
      nodes: { image?: { sourceUrl?: string | null; thumbnail?: string | null } | null }[];
    };
  }>(print(ProductsQuery));

  for (const product of shop.products?.nodes ?? []) {
    const image = product.image;
    if (!image?.sourceUrl) continue;
    add(wpMediaKey(image.sourceUrl), image.thumbnail || thumbUrl(image.sourceUrl));
  }

  const { pages, posts } = await graphql<{
    pages: { nodes: { uri?: string | null }[] };
    posts: { nodes: { uri?: string | null }[] };
  }>(print(AllContentQuery));

  const uris = [...(pages?.nodes ?? []), ...(posts?.nodes ?? [])]
    .map((node) => node.uri)
    .filter((uri): uri is string => Boolean(uri));

  for (const uri of uris) {
    await sleep(DELAY_MS);
    const { contentNode } = await graphql<{
      contentNode: { content?: string | null } | null;
    }>(print(ContentQuery), { slug: uri, idType: "URI", preview: false });

    for (const segment of splitWpContent(contentNode?.content)) {
      if (segment.type !== "gallery") continue;
      for (const image of segment.images) {
        add(wpMediaKey(image.src), thumbUrl(image.src));
      }
    }
  }

  return jobs;
}

async function main() {
  const cache = await loadCache();
  const jobs = await collectJobs();
  const missing = jobs.filter((job) => !cache[job.key]);

  console.log(`lqip: ${jobs.length} images, ${missing.length} missing`);

  let wrote = 0;
  for (const job of missing) {
    await sleep(DELAY_MS);
    try {
      const displaySrc = job.fetchUrl.includes("-150x150")
        ? job.fetchUrl.replace("-150x150", "")
        : job.fetchUrl;
      const dataUrl = await encode(job.fetchUrl, displaySrc);
      if (!dataUrl) {
        console.warn(`lqip: skip ${job.key}`);
        continue;
      }
      cache[job.key] = dataUrl;
      wrote += 1;
      console.log(`lqip: + ${job.key}`);
    } catch (error) {
      console.warn(`lqip: fail ${job.key}`, error);
    }
  }

  await mkdir(dirname(CACHE_PATH), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(CACHE_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`lqip: wrote ${wrote} new, ${Object.keys(sorted).length} total → ${CACHE_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
