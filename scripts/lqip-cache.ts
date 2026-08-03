import { cp, mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { print } from "graphql/language/printer";
import gql from "graphql-tag";

import { parseFeedItems } from "../src/components/News/facebookFeed";
import { NewsQuery } from "../src/components/News/NewsQuery";
import { AllContentQuery } from "../src/queries/general/AllContentQuery";
import { ContentQuery } from "../src/queries/general/ContentQuery";
import { ProductsQuery } from "../src/queries/general/ProductsQuery";
import { encodeLqipWebp, fetchLqipWebp } from "../src/utils/lqipEncode";
import { fbPostKey, lqipMetaRelPath, lqipRelPath, wpMediaKey } from "../src/utils/lqipPath";
import { MEDIA_WIDTHS, mediaStem } from "../src/utils/mediaPaths";
import { splitWpContent } from "../src/utils/prepareWpContent";

const ROOT = join(import.meta.dirname, "..");
const LQIP_DIR = join(ROOT, "src/content/lqip");
const IMG_DIR = join(ROOT, "public/_img");
const IMG_CACHE_DIR = join(ROOT, ".next/cache/_img");
const MANIFEST_PATH = join(ROOT, "src/content/img-manifest.json");
/**
 * `{uri: modifiedGmt}` from the last completed run. Lives in `.next/cache` so
 * it travels with the `_img` cache it vouches for — a cold cache loses both,
 * and a full crawl rebuilds both.
 */
const CRAWL_PATH = join(ROOT, ".next/cache/lqip-crawl.json");
const WP = process.env.NEXT_PUBLIC_WORDPRESS_API_URL ?? "https://bachanaliafantastyczne.pl";
const DELAY_MS = 350;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Job = {
  fullUrl: string;
  key: string;
  thumbUrl: string;
  variants: boolean;
  /**
   * Only the Facebook feed needs its size written down — `lqipAsset` reads
   * that file for nothing else. Every WordPress image already carries
   * `mediaDetails`, so recording it here would cost a full-size download per
   * upload per build to produce a number no component reads.
   */
  dimensions: boolean;
};

/**
 * `fetchGraphQL`'s ladder, and the same reason: Wordfence throttles the
 * client, not the request, and recovers on its own if the backoff outlasts it.
 */
const RETRY_DELAYS_MS = [500, 2000, 6000, 15_000, 30_000];

const isTransient = (status: number) => status === 403 || status === 429 || status >= 500;

async function graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${WP}/graphql`);
  url.searchParams.set("query", query);
  if (Object.keys(variables).length > 0) {
    url.searchParams.set("variables", JSON.stringify(variables));
  }

  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAYS_MS[attempt - 1]);

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
    let body: { data?: unknown; errors?: { message: string }[] };

    try {
      body = await response.json();
    } catch {
      lastError = new Error(`GraphQL: unparseable response from ${url.pathname}`);
      continue;
    }

    if (body.errors) {
      throw new Error(body.errors.map((error) => error.message).join("; "));
    }

    return body.data as T;
  }

  throw lastError;
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

function fullUrl(src: string) {
  try {
    const url = new URL(src);
    url.pathname = url.pathname
      .replace(/-\d+x\d+(?=\.[^.]+$)/, "")
      .replace(/-scaled(?=\.[^.]+$)/, "");
    return url.toString();
  } catch {
    return src;
  }
}

function lqipFile(key: string) {
  return join(LQIP_DIR, lqipRelPath(key));
}

function lqipMetaFile(key: string) {
  return join(LQIP_DIR, lqipMetaRelPath(key));
}

async function writeMeta(key: string, width: number, height: number) {
  await writeFile(lqipMetaFile(key), String(JSON.stringify({ width, height })));
}

async function writeLqip(key: string, webp: Buffer) {
  await writeBinary(lqipFile(key), webp);
}

function variantFile(key: string, width: number) {
  return join(IMG_DIR, mediaStem(key), `${width}.webp`);
}

async function exists(path: string) {
  try {
    return (await readFile(path)).byteLength > 0;
  } catch {
    return false;
  }
}

async function writeBinary(path: string, bytes: Buffer) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
}

async function listFiles(dir: string, suffix: string): Promise<string[]> {
  try {
    const nodes = await readdir(dir, { withFileTypes: true });
    const out: string[] = [];
    for (const node of nodes) {
      const path = join(dir, node.name);
      if (node.isDirectory()) out.push(...(await listFiles(path, suffix)));
      else if (node.name.endsWith(suffix)) out.push(path);
    }
    return out;
  } catch {
    return [];
  }
}

async function migrateTextLqips() {
  const files = await listFiles(LQIP_DIR, ".lqip");
  let moved = 0;

  for (const path of files) {
    const text = (await readFile(path, "utf8")).trim();
    const base64 = text.startsWith("data:image/webp;base64,")
      ? text.slice("data:image/webp;base64,".length)
      : text;
    const { webp } = await encodeLqipWebp(Buffer.from(base64, "base64"));
    const target = path.replace(/(\.[^.]+)?\.lqip$/, ".webp");
    await writeBinary(target, webp);
    await unlink(path);
    moved += 1;
  }

  return moved;
}

async function loadManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as Record<string, number[]>;
  } catch {
    return {};
  }
}

async function loadCrawl(): Promise<Record<string, string>> {
  try {
    return JSON.parse(await readFile(CRAWL_PATH, "utf8")) as Record<string, string>;
  } catch {
    return {};
  }
}

async function collectJobs(): Promise<{ crawl: Record<string, string>; jobs: Job[] }> {
  const jobs: Job[] = [];
  const seen = new Set<string>();

  const add = (job: Job) => {
    if (seen.has(job.key)) return;
    seen.add(job.key);
    jobs.push(job);
  };

  const addWp = (src: string, thumbnail?: string | null, variants = false) => {
    add({
      key: wpMediaKey(src),
      thumbUrl: thumbnail || thumbUrl(src),
      fullUrl: fullUrl(src),
      variants,
      dimensions: false,
    });
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
    addWp(image.sourceUrl, image.thumbnail);
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
    add({
      key: fbPostKey(entry.id),
      thumbUrl: entry.image.src,
      fullUrl: entry.image.src,
      variants: false,
      dimensions: true,
    });
  }

  const shop = await graphql<{
    products: {
      nodes: { image?: { sourceUrl?: string | null; thumbnail?: string | null } | null }[];
    };
  }>(print(ProductsQuery));

  for (const product of shop.products?.nodes ?? []) {
    const { image } = product;
    if (!image?.sourceUrl) continue;
    addWp(image.sourceUrl, image.thumbnail);
  }

  const { pages, posts } = await graphql<{
    pages: { nodes: { modifiedGmt?: string | null; uri?: string | null }[] };
    posts: { nodes: { modifiedGmt?: string | null; uri?: string | null }[] };
  }>(print(AllContentQuery));

  const previous = await loadCrawl();
  const crawl: Record<string, string> = {};
  let skipped = 0;

  const nodes = [...(pages?.nodes ?? []), ...(posts?.nodes ?? [])].filter(
    (node): node is { modifiedGmt?: string | null; uri: string } => Boolean(node.uri),
  );

  for (const { uri, modifiedGmt } of nodes) {
    const stamp = modifiedGmt ?? "";
    crawl[uri] = stamp;

    /**
     * A page edited since the last run may hold new gallery images; one left
     * alone cannot — its images are already on disk and in the manifest. So
     * only edited pages are worth a ContentQuery against a server where each
     * one costs seconds.
     */
    if (stamp && previous[uri] === stamp) {
      skipped += 1;
      continue;
    }

    await sleep(DELAY_MS);
    const { contentNode } = await graphql<{
      contentNode: { content?: string | null } | null;
    }>(print(ContentQuery), { slug: uri, idType: "URI", preview: false });

    for (const segment of splitWpContent(contentNode?.content)) {
      if (segment.type !== "gallery") continue;
      for (const image of segment.images) {
        addWp(image.src, null, true);
      }
    }
  }

  if (skipped > 0) console.log(`media: crawl skipped ${skipped}/${nodes.length} unchanged pages`);

  return { jobs, crawl };
}

async function fetchBytes(url: string) {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) return undefined;
  return Buffer.from(await response.arrayBuffer());
}

async function encodeWidths(bytes: Buffer) {
  const { default: sharp } = await import("sharp");
  const out: { webp: Buffer; width: number }[] = [];

  for (const width of MEDIA_WIDTHS) {
    const webp = await sharp(bytes)
      .resize(width, undefined, { withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    out.push({ width, webp });
  }

  return out;
}

async function main() {
  await mkdir(LQIP_DIR, { recursive: true });
  await mkdir(IMG_DIR, { recursive: true });
  await cp(IMG_CACHE_DIR, IMG_DIR, { recursive: true, force: false }).catch(() => {});

  const migrated = await migrateTextLqips();
  if (migrated > 0) console.log(`media: recompressed ${migrated} .lqip → .webp`);

  const { jobs, crawl } = await collectJobs();
  const manifest = await loadManifest();
  let lqipWrote = 0;
  let variantWrote = 0;
  let failed = false;

  console.log(`media: ${jobs.length} images`);

  for (const job of jobs) {
    const needLqip = !(await exists(lqipFile(job.key)));
    const needMeta = job.dimensions && !(await exists(lqipMetaFile(job.key)));
    const widthsToBuild: number[] = [];
    if (job.variants) {
      const onDisk: number[] = [];

      for (const width of MEDIA_WIDTHS) {
        if (await exists(variantFile(job.key, width))) onDisk.push(width);
        else widthsToBuild.push(width);
      }

      /**
       * A restored `_img` cache means there is nothing to encode, and the loop
       * below would skip the image entirely — leaving the manifest naming only
       * whatever this run happened to build, and every other photo falling back
       * to the raw WordPress original. The file on disk is the fact; record it
       * whether or not this run is the one that wrote it.
       */
      if (onDisk.length > 0) manifest[job.key] = onDisk;
    }

    if (!needLqip && !needMeta && widthsToBuild.length === 0) continue;

    await sleep(DELAY_MS);

    try {
      if (needLqip && widthsToBuild.length === 0) {
        const encoded = (await fetchLqipWebp(job.thumbUrl)) ?? (await fetchLqipWebp(job.fullUrl));
        if (!encoded) {
          console.warn(`media: skip lqip ${job.key}`);
          failed = true;
          continue;
        }
        await writeLqip(job.key, encoded.webp);
        if (needMeta) await writeMeta(job.key, encoded.width, encoded.height);
        lqipWrote += 1;
        console.log(`media: lqip ${job.key}`);
        continue;
      }

      const bytes = await fetchBytes(job.fullUrl);
      if (!bytes) {
        console.warn(`media: skip fetch ${job.key}`);
        failed = true;
        continue;
      }

      if (needLqip || needMeta) {
        const encoded = await encodeLqipWebp(bytes);
        if (needLqip) {
          await writeLqip(job.key, encoded.webp);
          if (needMeta) await writeMeta(job.key, encoded.width, encoded.height);
          lqipWrote += 1;
          console.log(`media: lqip ${job.key}`);
        } else {
          await writeMeta(job.key, encoded.width, encoded.height);
          console.log(`media: meta ${job.key} ${encoded.width}x${encoded.height}`);
        }
      }

      if (widthsToBuild.length > 0) {
        const encoded = await encodeWidths(bytes);
        const built: number[] = [...(manifest[job.key] ?? [])];
        for (const { width, webp } of encoded) {
          if (!widthsToBuild.includes(width)) continue;
          await writeBinary(variantFile(job.key, width), webp);
          if (!built.includes(width)) built.push(width);
          variantWrote += 1;
        }
        manifest[job.key] = built.sort((a, b) => a - b);
        console.log(`media: widths ${job.key} → ${built.join(",")}`);
      }
    } catch (error) {
      console.warn(`media: fail ${job.key}`, error);
      failed = true;
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
  );

  /**
   * One line per upload, ladders inline. `JSON.stringify(…, 2)` puts each width
   * on its own line and turns a run that adds one photo into a nine-hundred-line
   * diff; the formatter is told to leave this file alone, so the shape has to
   * come from here.
   */
  const lines = Object.entries(sorted).map(
    ([key, ladder]) => `  ${JSON.stringify(key)}: [${ladder.join(", ")}]`,
  );

  await writeFile(MANIFEST_PATH, `{\n${lines.join(",\n")}\n}\n`);

  await cp(IMG_DIR, IMG_CACHE_DIR, { recursive: true }).catch(() => {});

  if (failed) {
    console.log("media: fetches failed, crawl snapshot withheld");
  } else {
    await mkdir(dirname(CRAWL_PATH), { recursive: true });
    await writeFile(CRAWL_PATH, String(JSON.stringify(crawl, null, 2)));
  }

  console.log(
    `media: wrote ${lqipWrote} lqips, ${variantWrote} variants, ${Object.keys(sorted).length} in manifest`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
