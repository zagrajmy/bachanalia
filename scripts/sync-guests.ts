import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { driveFileId } from "../src/components/Exhibitors/exhibitors";
import { guestsFromXlsx, type GuestSheetRow } from "./guest-sheet";

const ROOT = join(import.meta.dirname, "..");
const PHOTO_DIR = join(ROOT, "src/content/guests");
const OUT_PATH = join(ROOT, "src/content/guests.generated.ts");
const SHEET_ID = "1CYaYf3tlG8TlhpwZt4H4MmHgdQIugocfeopiYeMnoMA";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;
const MAX_PHOTO_PX = 2048;
const TIMEOUT_MS = 30_000;
const IMAGE_FILE = /\.(?:avif|gif|jpe?g|png|webp)$/i;

async function fetchRows() {
  const response = await fetch(SHEET_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`sheet: ${response.status} ${response.statusText}`);
  return guestsFromXlsx(await response.arrayBuffer());
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

async function fetchDrivePhoto(slug: string, link: string) {
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
  return new Uint8Array(await response.arrayBuffer());
}

async function visuallyEquivalent(first: Uint8Array, second: Uint8Array) {
  const { default: sharp } = await import("sharp");
  const pixels = async (source: Uint8Array) =>
    sharp(source)
      .rotate()
      .flatten({ background: "#fff" })
      .resize(64, 64, { background: "#fff", fit: "contain" })
      .removeAlpha()
      .raw()
      .toBuffer();
  const [a, b] = await Promise.all([pixels(first), pixels(second)]);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference += Math.abs(a[index]! - b[index]!);
  return difference / a.length <= 1;
}

async function writePhoto(slug: string, source: Uint8Array) {
  const { default: sharp } = await import("sharp");
  const jpeg = await sharp(source)
    .rotate()
    .resize(MAX_PHOTO_PX, MAX_PHOTO_PX, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#fff" })
    .jpeg({ quality: 85 })
    .toBuffer();
  const file = `${slug}.jpg`;
  const path = join(PHOTO_DIR, file);
  const current = await readFile(path).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return undefined;
    throw error;
  });
  if (!current || !(await visuallyEquivalent(current, jpeg))) {
    await writeFile(path, jpeg);
    console.log(`guests: photo ${file}`);
  }
  return file;
}

async function photoFor(row: GuestSheetRow, slug: string) {
  const source = row.photo ?? (row.Zdjęcie ? await fetchDrivePhoto(slug, row.Zdjęcie) : undefined);
  return source ? writePhoto(slug, source) : undefined;
}

async function main() {
  const rows = await fetchRows();
  const guests: string[] = [];
  const imports: string[] = [];
  const slugs = new Set<string>();
  const photoFiles = new Set<string>();

  for (const row of rows) {
    const name = `${row.Imię} ${row.Nazwisko}`.trim().replaceAll(/\s+/g, " ");
    if (!name) continue;

    const slug = slugify(name);
    if (slugs.has(slug)) throw new Error(`guests: two rows slug to ${slug}`);
    slugs.add(slug);

    const bio = paragraphs(row.Bio);
    const photo = await photoFor(row, slug);
    const fields = [`name: ${JSON.stringify(name)}`, `slug: ${JSON.stringify(slug)}`];
    if (photo) {
      photoFiles.add(photo);
      const ident = slug.replaceAll("-", "_");
      imports.push(`import ${ident} from "./guests/${photo}";`);
      fields.push(`photo: ${ident}`);
    }
    if (bio.length > 0) fields.push(`bio: ${JSON.stringify(bio)}`);
    guests.push(`{ ${fields.join(", ")} }`);
  }

  if (guests.length === 0) throw new Error("guests: the sheet came back empty, refusing to write");

  for (const file of await readdir(PHOTO_DIR)) {
    if (!IMAGE_FILE.test(file) || photoFiles.has(file)) continue;
    await unlink(join(PHOTO_DIR, file));
    console.log(`guests: dropped photo ${file}, no photo in the sheet`);
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
  console.log(`guests: ${guests.length} synced, ${photoFiles.size} with photos`);
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
