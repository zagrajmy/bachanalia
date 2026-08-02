import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { fbPostKey, lqipMetaRelPath, lqipRelPath, wpMediaKey } from "./lqipPath";

export { fbPostKey, wpMediaKey } from "./lqipPath";

const DIR = join(process.cwd(), "src/content/lqip");
const PREFIX = "data:image/webp;base64,";

export type LqipAsset = {
  blurDataURL: string;
  width: number;
  height: number;
};

export function webpToDataUrl(webp: Uint8Array) {
  return `${PREFIX}${Buffer.from(webp).toString("base64")}`;
}

/** Intrinsic size from a VP8/VP8L/VP8X WebP. */
export function webpSize(bytes: Uint8Array): { width: number; height: number } | undefined {
  if (
    bytes.length < 30 ||
    Buffer.from(bytes.subarray(0, 4)).toString("ascii") !== "RIFF" ||
    Buffer.from(bytes.subarray(8, 12)).toString("ascii") !== "WEBP"
  ) {
    return undefined;
  }

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const fourcc = Buffer.from(bytes.subarray(offset, offset + 4)).toString("ascii");
    const size = Buffer.from(bytes.subarray(offset + 4, offset + 8)).readUInt32LE(0);
    const payload = offset + 8;

    if (fourcc === "VP8X" && payload + 10 <= bytes.length) {
      return {
        width: 1 + Buffer.from(bytes.subarray(payload + 4, payload + 7)).readUIntLE(0, 3),
        height: 1 + Buffer.from(bytes.subarray(payload + 7, payload + 10)).readUIntLE(0, 3),
      };
    }

    if (fourcc === "VP8 " && payload + 10 <= bytes.length) {
      return {
        width: Buffer.from(bytes.subarray(payload + 6, payload + 8)).readUInt16LE(0) & 0x3fff,
        height: Buffer.from(bytes.subarray(payload + 8, payload + 10)).readUInt16LE(0) & 0x3fff,
      };
    }

    if (fourcc === "VP8L" && payload + 5 <= bytes.length) {
      const bits = Buffer.from(bytes.subarray(payload + 1, payload + 5)).readUInt32LE(0);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }

    offset = payload + size + (size & 1);
  }

  return undefined;
}

function readDims(key: string, webp: Buffer) {
  const metaPath = join(DIR, lqipMetaRelPath(key));
  if (existsSync(metaPath)) {
    const meta = JSON.parse(readFileSync(metaPath, "utf8")) as { width?: number; height?: number };
    if (meta.width && meta.height) return { width: meta.width, height: meta.height };
  }

  return webpSize(webp);
}

export function lqipAsset(key?: string | null): LqipAsset | undefined {
  if (!key) return undefined;

  const path = join(DIR, lqipRelPath(key));
  if (!existsSync(path)) return undefined;

  const webp = readFileSync(path);
  const dims = readDims(key, webp);
  if (!dims) return undefined;

  return { blurDataURL: webpToDataUrl(webp), width: dims.width, height: dims.height };
}

export function lqip(key?: string | null) {
  return lqipAsset(key)?.blurDataURL;
}

export function lqipForWpUrl(url?: string | null) {
  if (!url) return undefined;
  return lqip(wpMediaKey(url));
}

export function lqipAssetForWpUrl(url?: string | null) {
  if (!url) return undefined;
  return lqipAsset(wpMediaKey(url));
}
