import logosThatReadOnDark from "@/content/exhibitorLogosOnDark.json";
import type { Exhibitor, ExhibitorLink } from "@/content/exhibitors";

/**
 * Measured by `scripts/exhibitor-logos.ts`. A logo added to the sheet since the
 * last build is unmeasured, so it gets a plate: legibility beats an unnecessary
 * plate, which light mode cannot show anyway.
 */
const READS_ON_DARK = new Set<string>(logosThatReadOnDark);

const SHEET_ID = "12Hg1BnP1b4yU1zCf6LUEbfPyD-zIHShAVwGT7N5mSp0";
export const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
const REVALIDATE_SECONDS = 10_800;

/** A small RFC 4180 reader: Sheets descriptions contain both newlines and quoted commas. */
export function parseCsv(source: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  row.push(cell);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

const clean = (value?: string) => value?.trim().replaceAll(/\s+/g, " ") || undefined;

function socialLabel(href: string) {
  try {
    const hostname = new URL(href).hostname.replace(/^www\./, "");
    if (hostname.includes("instagram.com")) return "Instagram";
    if (hostname.includes("facebook.com")) return "Facebook";
    if (hostname.includes("tiktok.com")) return "TikTok";
    if (hostname.includes("linktr.ee")) return "Linktree";
    return hostname;
  } catch {
    return "Strona";
  }
}

export function extractLinks(value?: string): ExhibitorLink[] {
  if (!value) return [];

  const matches = value.match(/(?:https?:\/\/|www\.)[^\s,]+/g) ?? [];
  const unique = new Set<string>();

  return matches.flatMap((match) => {
    const trimmed = match.replace(/[.;:!?)]*$/, "");
    const href = trimmed.startsWith("www.") ? `https://${trimmed}` : trimmed;
    if (unique.has(href)) return [];
    unique.add(href);
    return [{ href, label: socialLabel(href) }];
  });
}

export function driveImageUrl(value?: string) {
  if (!value) return undefined;
  const id = value.match(/\/d\/([^/]+)/)?.[1] ?? value.match(/[?&]id=([^&]+)/)?.[1];
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w640` : undefined;
}

const normalizeHeader = (value: string) => value.replace(/^﻿/, "").trim().toLocaleLowerCase("pl");

export function exhibitorsFromCsv(source: string): Exhibitor[] {
  const [rawHeaders = [], ...rows] = parseCsv(source);
  const headers = rawHeaders.map(normalizeHeader);
  const column = (...names: string[]) =>
    names.map((name) => headers.indexOf(name)).find((i) => i >= 0);
  const nameIndex = column("nazwa", "name");
  const descriptionIndex = column("opis", "description");
  const linksIndex = column("media społecznościowe", "media", "linki", "links");
  const logoIndex = column("logo", "logotyp");

  if (nameIndex === undefined) return [];

  return rows.flatMap((row) => {
    const name = clean(row[nameIndex]);
    if (!name) return [];

    const logoUrl = logoIndex === undefined ? undefined : driveImageUrl(clean(row[logoIndex]));

    return [
      {
        name,
        description: descriptionIndex === undefined ? undefined : clean(row[descriptionIndex]),
        logoUrl,
        logoNeedsPlate: logoUrl !== undefined && !READS_ON_DARK.has(logoUrl),
        links: linksIndex === undefined ? [] : extractLinks(row[linksIndex]),
      },
    ];
  });
}

export async function fetchExhibitors(): Promise<Exhibitor[]> {
  try {
    const response = await fetch(SHEET_CSV_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { accept: "text/csv" },
    });

    if (!response.ok) throw new Error(`Google Sheets returned ${response.status}`);
    return exhibitorsFromCsv(await response.text());
  } catch {
    return [];
  }
}
