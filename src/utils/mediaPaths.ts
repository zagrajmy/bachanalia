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
  // eslint-disable-next-line unicorn/prefer-at -- at() is `number | undefined`, and every caller has already checked the list is not empty
  return available[available.length - 1];
}

const widths = manifest as Record<string, number[]>;

/**
 * Serves build-time WebPs from `/_img`. Falls back to the WordPress URL when
 * the manifest has no entry yet — no `/_next/image` either way.
 */
export function mediaLoader({ src, width }: { src: string; width: number }) {
  const key = wpMediaKey(src);
  const available = widths[key];
  if (!available?.length) return src;
  return mediaVariantUrl(key, pickMediaWidth(width, available));
}
