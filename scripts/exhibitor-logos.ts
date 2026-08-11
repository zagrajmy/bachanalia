/**
 * Records which exhibitor logos survive the dark card on their own, so the
 * others can be given a paper plate without putting a white box behind every
 * logo on the page. Reads the same sheet the directory does and writes the
 * verdict next to the other precomputed image data.
 *
 * Runs before `next build`, and a deploy must never hinge on Google answering:
 * anything short of a complete set of measurements leaves the committed list
 * alone and exits 0. A partial write would be worse than a stale one — it would
 * silently plate every logo whose fetch happened to fail.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  driveFileId,
  exhibitorsFromCsv,
  SHEET_CSV_URL,
} from "../src/components/Exhibitors/exhibitors";
import { measureLogo, readsOnDark } from "../src/utils/logoContrast";

const OUT = join(import.meta.dirname, "..", "src/content/exhibitorLogosOnDark.json");

/** Big enough for the mean to be stable, small enough to decode instantly. */
const SAMPLE = 64;

const keep = (why: string) => {
  console.warn(`[exhibitor-logos] ${why}; keeping the committed list`);
  process.exit(0);
};

/** Google can accept a connection and then never answer; a build must not wait on it. */
const TIMEOUT_MS = 15_000;

/** Drive throttles a burst of downloads, and 22 logos are no slower a few at a time. */
const CONCURRENCY = 6;

async function mapPool<T, R>(items: T[], run: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = Array.from({ length: items.length });
  let next = 0;

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        const item = items[index];

        if (item !== undefined) out[index] = await run(item);
      }
    }),
  );

  return out;
}

async function measure(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${response.status} for ${url}`);

  const { default: sharp } = await import("sharp");
  const { data } = await sharp(Buffer.from(await response.arrayBuffer()))
    .resize(SAMPLE, SAMPLE, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return measureLogo(data);
}

const sheet = await fetch(SHEET_CSV_URL, {
  headers: { accept: "text/csv" },
  signal: AbortSignal.timeout(TIMEOUT_MS),
}).catch(() => null);
if (!sheet?.ok) keep(`the sheet answered ${sheet?.status ?? "nothing"}`);

const exhibitors = await sheet!
  .text()
  .then(exhibitorsFromCsv)
  .catch((error) => keep(`the sheet could not be read: ${String(error)}`));

const logos = exhibitors.map((exhibitor) => exhibitor.logoUrl).filter((url) => url !== undefined);

const measured = await mapPool(logos, async (url) => {
  try {
    return { id: driveFileId(url), reads: readsOnDark(await measure(url)) };
  } catch (error) {
    console.warn(`[exhibitor-logos] could not read ${url}: ${String(error)}`);
    return undefined;
  }
});

if (measured.some((entry) => entry === undefined)) keep("some logos could not be read");

const safe = measured
  .filter((entry) => entry !== undefined)
  .filter((entry) => entry.reads)
  .map((entry) => entry.id)
  .filter((id) => id !== undefined)
  .sort();

await writeFile(OUT, `${JSON.stringify(safe, null, 2)}\n`);
console.log(`[exhibitor-logos] ${logos.length} logos: ${safe.length} read on dark`);
