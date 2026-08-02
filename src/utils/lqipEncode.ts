const SIZE = 8;
const QUALITY = 20;

export type EncodedLqip = {
  webp: Buffer;
  width: number;
  height: number;
};

export async function encodeLqipWebp(bytes: ArrayBuffer | Uint8Array): Promise<EncodedLqip> {
  const { default: sharp } = await import("sharp");
  const buffer = Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
  const image = sharp(buffer);
  const { width, height } = await image.metadata();
  if (!width || !height) throw new Error("image has no dimensions");

  const webp = await image.resize(SIZE, SIZE, { fit: "inside" }).webp({ quality: QUALITY }).toBuffer();

  return { webp, width, height };
}

export async function fetchLqipWebp(url: string) {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) return undefined;
  return encodeLqipWebp(await response.arrayBuffer());
}
