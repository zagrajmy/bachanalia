/**
 * Records which exhibitor logos survive the dark card on their own, so the
 * others can be given a paper plate without putting a white box behind every
 * logo on the page. Reads the same sheet the directory does and writes the
 * verdict next to the other precomputed image data.
 *
 * Runs in the build, before `next build`, and keeps the committed list when
 * Drive or the sheet is unreachable — a failed fetch must not silently drop
 * plates from logos that need them.
 */
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { exhibitorsFromCsv, SHEET_CSV_URL } from "../src/components/Exhibitors/exhibitors";
import { measureLogo, readsOnDark } from "../src/utils/logoContrast";

const OUT = join(import.meta.dirname, "..", "src/content/exhibitorLogosOnDark.json");

/** Big enough for the mean to be stable, small enough to decode instantly. */
const SAMPLE = 64;

async function measure(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);

  const { default: sharp } = await import("sharp");
  const { data, info } = await sharp(Buffer.from(await response.arrayBuffer()))
    .resize(SAMPLE, SAMPLE, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return measureLogo(data, info.channels);
}

const response = await fetch(SHEET_CSV_URL, { headers: { accept: "text/csv" } });
if (!response.ok) throw new Error(`Google Sheets returned ${response.status}`);

const logos = exhibitorsFromCsv(await response.text())
  .map((exhibitor) => exhibitor.logoUrl)
  .filter((url) => url !== undefined);

const safe: string[] = [];
let plated = 0;

for (const url of logos) {
  try {
    const measured = await measure(url);
    if (readsOnDark(measured)) {
      safe.push(url);
    } else {
      plated += 1;
    }
  } catch (error) {
    console.warn(`[exhibitor-logos] could not read ${url}: ${String(error)}`);
  }
}

await writeFile(OUT, `${JSON.stringify(safe.sort(), null, 2)}\n`);
console.log(
  `[exhibitor-logos] ${logos.length} logos: ${safe.length} read on dark, ${plated} plated`,
);
