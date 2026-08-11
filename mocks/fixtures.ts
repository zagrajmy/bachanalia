import { createHash } from "node:crypto";
import type { JsonBodyType } from "msw";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Recorded WordPress answers, in version control, so the e2e suite never asks
 * the live server anything. That server answers one query in ~1.3s and eight in
 * parallel in ~10s each, and Cloudflare starts refusing automated clients well
 * before a full run finishes — a suite that talks to it is slow when it passes
 * and lies when it fails.
 */
export const FIXTURE_DIR = join(process.cwd(), "e2e", "fixtures", "wp");

export const SNAPSHOT_FILE = join(FIXTURE_DIR, "cart-snapshots.json");

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};

    for (const key of Object.keys(source).sort()) sorted[key] = sortKeys(source[key]);

    return sorted;
  }

  return value;
}

/** Key order out of `JSON.stringify` follows insertion, which callers vary. */
export function stableStringify(value: unknown) {
  return JSON.stringify(sortKeys(value) ?? null);
}

function readable(json: string) {
  return json
    .replaceAll(/[^A-Za-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 56)
    .toLowerCase();
}

/**
 * One file per operation and argument set, named so `ls` reads as a list of
 * what the suite asks WordPress for. The hash only breaks ties between two
 * variable sets whose readable prefix truncated to the same thing.
 */
export function fixtureName(operation: string, variables: unknown) {
  const json = stableStringify(variables);

  if (json === "{}" || json === "null") return `${operation}.json`;

  const digest = createHash("sha1").update(json).digest("hex").slice(0, 8);

  return `${operation}.${readable(json)}.${digest}.json`;
}

/**
 * Read every time rather than memoised: a re-record has to take effect without
 * restarting the server, and caching a *miss* is how a fixture that was just
 * written keeps looking absent.
 */
export function readFixture(operation: string, variables: unknown): JsonBodyType | undefined {
  const path = join(FIXTURE_DIR, fixtureName(operation, variables));

  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as JsonBodyType) : undefined;
}

export function writeFixture(operation: string, variables: unknown, body: unknown) {
  mkdirSync(FIXTURE_DIR, { recursive: true });

  const name = fixtureName(operation, variables);

  writeFileSync(join(FIXTURE_DIR, name), `${JSON.stringify(body, null, 2)}\n`);

  return name;
}

export type CartSnapshots = {
  /** `<productId>:<variationId>:<quantity>` lines, sorted and joined by `|`. */
  carts: Record<string, unknown>;
  /** WooCommerce's own answer for a cart with nothing in it. */
  empty: unknown;
};

export function readSnapshots(): CartSnapshots {
  if (!existsSync(SNAPSHOT_FILE)) return { empty: undefined, carts: {} };

  return JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8")) as CartSnapshots;
}

export function writeSnapshots(snapshots: CartSnapshots) {
  mkdirSync(FIXTURE_DIR, { recursive: true });
  writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(snapshots, null, 2)}\n`);
}
