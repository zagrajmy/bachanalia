import { readdir, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { driveFileId } from "../src/components/Exhibitors/exhibitors";

const ROOT = join(import.meta.dirname, "..");
const PHOTO_DIR = join(ROOT, "src/content/guests");
const OUT_PATH = join(ROOT, "src/content/guests.generated.ts");
const SHEET_ID = "1CYaYf3tlG8TlhpwZt4H4MmHgdQIugocfeopiYeMnoMA";
/** The visualization endpoint answers JSON for a public sheet; the CSV export would need a parser. */
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1`;
const MAX_PHOTO_PX = 2048;
const TIMEOUT_MS = 30_000;
const COLUMNS = ["Imię", "Nazwisko", "Bio", "Zdjęcie"] as const;

type Row = Record<(typeof COLUMNS)[number], string>;

async function fetchRows(): Promise<Row[]> {
  const response = await fetch(SHEET_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`sheet: ${response.status} ${response.statusText}`);

  const text = await response.text();
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- the gviz wire shape, stable for a decade
  const { table } = JSON.parse(text.slice(text.indexOf("(") + 1, text.lastIndexOf(")"))) as {
    table: { cols: { label: string }[]; rows: { c: ({ v: number | string | null } | null)[] }[] };
  };

  const labels = table.cols.map(({ label }) => label);
  const missing = COLUMNS.filter((column) => !labels.includes(column));
  if (missing.length > 0) {
    throw new Error(`sheet: no ${missing.join(", ")} column among ${labels.join(", ")}`);
  }

  return table.rows.map((row) => {
    const cell = (column: keyof Row) => String(row.c[labels.indexOf(column)]?.v ?? "").trim();
    return {
      Imię: cell("Imię"),
      Nazwisko: cell("Nazwisko"),
      Bio: cell("Bio"),
      Zdjęcie: cell("Zdjęcie"),
    };
  });
}

function slugify(name: string) {
  return name
    .replaceAll(/„[^”]*”/g, "")
    .replaceAll("ł", "l")
    .replaceAll("Ł", "L")
    .normalize("NFD")
    .replaceAll(/\p{M}/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
}

/**
 * Pasted bios arrive with hard wraps mid-sentence; a line that does not end a
 * sentence continues the paragraph before it.
 */
function paragraphs(bio: string) {
  const out: string[] = [];
  for (const line of bio
    .split("\n")
    .map((line) => line.trim().replaceAll(/\s+/g, " "))
    .filter(Boolean)) {
    const last = out.at(-1);
    if (last && !/[.!?…:][”")]*$/.test(last)) out[out.length - 1] = `${last} ${line}`;
    else out.push(line);
  }
  return out;
}

async function fetchPhoto(slug: string, link: string) {
  const id = driveFileId(link);
  if (!id) {
    console.warn(`guests: unreadable photo link for ${slug}: ${link}`);
    return undefined;
  }

  const response = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
    console.warn(`guests: photo ${response.status} for ${slug}, keeping text only`);
    return undefined;
  }

  const { default: sharp } = await import("sharp");
  let jpeg: Buffer;

  try {
    jpeg = await sharp(Buffer.from(await response.arrayBuffer()))
      .rotate()
      .resize(MAX_PHOTO_PX, MAX_PHOTO_PX, { fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#fff" })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch (error) {
    console.warn(`guests: photo for ${slug} will not decode, keeping text only`, error);
    return undefined;
  }

  const file = `${slug}.jpg`;
  await writeFile(join(PHOTO_DIR, file), jpeg);
  console.log(`guests: photo ${file}`);
  return file;
}

async function main() {
  const rows = await fetchRows();
  const photos = new Map(
    (await readdir(PHOTO_DIR)).map((file) => [file.replace(/\.[^.]+$/, ""), file]),
  );
  const guests: string[] = [];
  const imports: string[] = [];
  const slugs = new Set<string>();

  for (const row of rows) {
    const name = `${row.Imię} ${row.Nazwisko}`.trim().replaceAll(/\s+/g, " ");
    if (!name) continue;

    const slug = slugify(name);
    if (slugs.has(slug)) throw new Error(`guests: two rows slug to ${slug}`);
    slugs.add(slug);

    const bio = paragraphs(row.Bio);
    /** A file on disk wins; drop it to pick the sheet's link up again. */
    const photo =
      photos.get(slug) ?? (row.Zdjęcie ? await fetchPhoto(slug, row.Zdjęcie) : undefined);

    const fields = [`name: ${JSON.stringify(name)}`, `slug: ${JSON.stringify(slug)}`];
    if (photo) {
      const ident = slug.replaceAll("-", "_");
      imports.push(`import ${ident} from "./guests/${photo}";`);
      fields.push(`photo: ${ident}`);
    }
    if (bio.length > 0) fields.push(`bio: ${JSON.stringify(bio)}`);
    guests.push(`{ ${fields.join(", ")} }`);
  }

  if (guests.length === 0) throw new Error("guests: the sheet came back empty, refusing to write");

  for (const [slug, file] of photos) {
    if (slugs.has(slug)) continue;
    await unlink(join(PHOTO_DIR, file));
    console.log(`guests: dropped photo ${file}, no such guest in the sheet`);
  }

  await writeFile(
    OUT_PATH,
    [
      "// Written by scripts/sync-guests.ts from the guests sheet; edit the sheet, not this file.",
      'import type { Guest } from "./guests";',
      "",
      ...imports,
      "",
      `export const guests: Guest[] = [${guests.join(",\n")}];`,
      "",
    ].join("\n"),
  );

  if (Bun.spawnSync(["bun", "x", "oxfmt", OUT_PATH]).exitCode !== 0)
    throw new Error("guests: oxfmt failed");
  console.log(`guests: ${guests.length} synced`);
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
