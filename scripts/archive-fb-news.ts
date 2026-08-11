import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import { FEED_PAGE_URI, parseFeedItems } from "../src/components/News/facebookFeed";
import type { ArchivedFbPost } from "../src/components/News/fbArchive";
import { encodeLqipWebp } from "../src/utils/lqipEncode";
import { fbPostKey, lqipMetaRelPath, lqipRelPath } from "../src/utils/lqipPath";
import { feedContent, FeedQuery } from "../src/queries/general/FeedQuery";
import { wpQuery } from "./wpGraphql";

const ROOT = join(import.meta.dirname, "..");
const ARCHIVE_PATH = join(ROOT, "src/content/fb-news.json");
const IMG_DIR = join(ROOT, "public/fb-news");
const LQIP_DIR = join(ROOT, "src/content/lqip");

async function loadArchive(): Promise<ArchivedFbPost[]> {
  try {
    return JSON.parse(await readFile(ARCHIVE_PATH, "utf8"));
  } catch {
    return [];
  }
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

async function main() {
  const feedPage = await wpQuery(FeedQuery, { uri: FEED_PAGE_URI });

  const feed = parseFeedItems(feedContent(feedPage));
  if (feed.length === 0) throw new Error("archive: feed parsed to zero posts, refusing to run");

  const archive = await loadArchive();
  const known = new Set(archive.map((post) => post.id));
  const fresh = feed.filter((entry) => !known.has(entry.id));

  if (fresh.length === 0) {
    console.log(`archive: no new posts (${archive.length} archived)`);
    return;
  }

  await mkdir(IMG_DIR, { recursive: true });

  for (const entry of fresh) {
    const image = entry.image?.src ? await mirrorImage(entry.id, entry.image.src) : undefined;

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
  console.log(`archive: ${fresh.length} new, ${archive.length} total`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
