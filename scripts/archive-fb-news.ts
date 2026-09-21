import { type } from "arktype";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { FEED_PAGE_URI, parseFeedItems } from "../src/components/News/facebookFeed";
import { facebookOpenGraphImage } from "../src/components/News/facebookOpenGraph";
import type { ArchivedFbPost } from "../src/components/News/fbArchive";
import type { NewsEntry } from "../src/components/News/newsFormat";
import { encodeLqipWebp } from "../src/utils/lqipEncode";
import { fbPostKey, lqipMetaRelPath, lqipRelPath } from "../src/utils/lqipPath";
import { feedContent, FeedQuery } from "../src/queries/general/FeedQuery";
import { wpQuery } from "./wpGraphql";

const ROOT = join(import.meta.dirname, "..");
const ARCHIVE_PATH = join(ROOT, "src/content/fb-news.json");
const IMG_DIR = join(ROOT, "public/fb-news");
const LQIP_DIR = join(ROOT, "src/content/lqip");
const POST_TIMEOUT_MS = 15_000;

const ArchivedFbPosts = type({
  dateTime: "string",
  excerpt: "string",
  href: "string",
  id: "string",
  "image?": { height: "number", src: "string", width: "number" },
  title: "string",
}).array();

/**
 * No archive yet is a first run. An archive that will not parse is a file
 * someone has to look at — answering with an empty list would rewrite it from
 * the current feed and drop every post Facebook has since aged out.
 */
async function loadArchive(): Promise<ArchivedFbPost[]> {
  if (!existsSync(ARCHIVE_PATH)) return [];

  const parsed = ArchivedFbPosts(JSON.parse(await readFile(ARCHIVE_PATH, "utf8")));

  if (parsed instanceof type.errors) {
    throw new TypeError(`archive: ${ARCHIVE_PATH} is not a post archive — ${parsed.summary}`);
  }

  return parsed;
}

async function mirrorImage(id: string, src: string) {
  const response = await fetch(src);
  if (!response.ok) {
    console.warn(`archive: image ${response.status} for ${id}, keeping text only`);
    return undefined;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  const { default: sharp } = await import("sharp");
  const webp = await sharp(bytes).webp({ quality: 80 }).toBuffer();
  const lqip = await encodeLqipWebp(bytes);
  const key = fbPostKey(id);

  await writeFile(join(IMG_DIR, `${id}.webp`), webp);

  const lqipFile = join(LQIP_DIR, lqipRelPath(key));
  if (!existsSync(lqipFile)) {
    await mkdir(dirname(lqipFile), { recursive: true });
    await writeFile(lqipFile, lqip.webp);
    await writeFile(
      join(LQIP_DIR, lqipMetaRelPath(key)),
      `${JSON.stringify({ width: lqip.width, height: lqip.height })}\n`,
    );
  }

  return { src: `/fb-news/${id}.webp`, width: lqip.width, height: lqip.height };
}

async function imageSource(entry: Pick<NewsEntry, "href" | "id" | "image">) {
  if (entry.image?.src) return entry.image.src;

  try {
    const response = await fetch(entry.href, { signal: AbortSignal.timeout(POST_TIMEOUT_MS) });
    if (!response.ok) {
      console.warn(`archive: post ${response.status} for ${entry.id}, keeping text only`);
      return undefined;
    }

    const image = facebookOpenGraphImage(await response.text());
    if (!image) console.warn(`archive: no public preview image for ${entry.id}, keeping text only`);
    return image;
  } catch (error) {
    console.warn(`archive: post unavailable for ${entry.id}, keeping text only`, error);
    return undefined;
  }
}

async function main() {
  const feedPage = await wpQuery(FeedQuery, { uri: FEED_PAGE_URI });

  const feed = parseFeedItems(feedContent(feedPage));
  if (feed.length === 0) throw new Error("archive: feed parsed to zero posts, refusing to run");

  const archive = await loadArchive();
  const known = new Set(archive.map((post) => post.id));
  const fresh = feed.filter((entry) => !known.has(entry.id));
  const liveById = new Map(feed.map((entry) => [entry.id, entry]));
  const backfill = archive.filter((post) => !post.image && liveById.has(post.id));

  if (fresh.length === 0 && backfill.length === 0) {
    console.log(`archive: no new posts or images (${archive.length} archived)`);
    return;
  }

  await mkdir(IMG_DIR, { recursive: true });

  let restored = 0;
  for (const post of backfill) {
    const live = liveById.get(post.id);
    if (!live) continue;

    const src = await imageSource(live);
    if (!src) continue;

    const image = await mirrorImage(post.id, src);
    if (!image) continue;

    post.image = image;
    restored += 1;
    console.log(`archive: image + ${post.id}`);
  }

  for (const entry of fresh) {
    const src = await imageSource(entry);
    const image = src ? await mirrorImage(entry.id, src) : undefined;

    archive.push({
      id: entry.id,
      href: entry.href,
      dateTime: entry.dateTime,
      title: entry.title,
      excerpt: entry.excerpt,
      ...(image && { image }),
    });

    console.log(`archive: + ${entry.dateTime.slice(0, 10)} ${entry.title.slice(0, 60)}`);
  }

  archive.sort((a, b) => b.dateTime.localeCompare(a.dateTime));
  await writeFile(ARCHIVE_PATH, `${JSON.stringify(archive, null, 2)}\n`);
  console.log(`archive: ${fresh.length} new, ${restored} images restored, ${archive.length} total`);
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
