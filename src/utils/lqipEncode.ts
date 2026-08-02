export async function encodeLqip(bytes: ArrayBuffer) {
  const { default: sharp } = await import("sharp");

  const webp = await sharp(Buffer.from(bytes))
    .resize(12, 12, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();

  return `data:image/webp;base64,${webp.toString("base64")}`;
}

export async function fetchLqip(url: string) {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) return undefined;
  return encodeLqip(await response.arrayBuffer());
}
