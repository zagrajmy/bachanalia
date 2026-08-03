import manifest from "@/content/img-manifest.json";

import { wpMediaKey } from "./lqipPath";

/** Matches the gallery/lightbox ladder without drowning the repo. */
export const MEDIA_WIDTHS = [256, 640, 1200, 1920] as const;

export function mediaStem(key: string) {
  return key.replace(/^\//, "").replace(/\.[^.]+$/, "");
}

/** Public URL for a build-time WebP variant. */
export function mediaVariantUrl(key: string, width: number) {
  return `/_img/${mediaStem(key)}/${width}.webp`;
}

export function pickMediaWidth(requested: number, available: number[]) {
  for (const width of available) {
    if (width >= requested) return width;
  }
  return available[available.length - 1];
}

const widths = manifest as { [key: string]: number[] };

/**
 * Serves build-time WebPs from `/_img`. An upload the manifest has not caught
 * up with yet goes through `/_next/image` rather than straight to WordPress:
 * the originals are `-scaled` 2560px JPEGs off a slow, rate-limited server, and
 * handing one to a phone is the whole thing the ladder exists to prevent.
 */
export function mediaLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const key = wpMediaKey(src);
  const available = widths[key];

  if (!available?.length) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality ?? 75}`;
  }

  return mediaVariantUrl(key, pickMediaWidth(width, available));
}
