/**
 * A `blurDataURL` for a remote WordPress upload.
 *
 * `placeholder="blur"` only accepts a data URL — Next inlines it into an SVG
 * filter, and an SVG loaded from a `data:` URL cannot reference an external
 * image — so the bytes have to be produced here rather than pointed at.
 *
 * The source is WordPress's own 150px thumbnail, roughly 7 kB against 200 kB
 * for the original, and it comes back as a 12px WebP of about 200 characters.
 * That is small enough to inline per card; the full-size upload is not.
 *
 * Every failure is swallowed. A missing placeholder costs a plain plate, and
 * that is not worth failing a prerender over.
 */
const placeholders = new Map<string, Promise<string | undefined>>();

async function render(url: string) {
  try {
    const { default: sharp } = await import("sharp");

    const response = await fetch(url, { cache: "force-cache" });
    if (!response.ok) return undefined;

    const webp = await sharp(Buffer.from(await response.arrayBuffer()))
      .resize(12, 12, { fit: "inside" })
      .webp({ quality: 40 })
      .toBuffer();

    return `data:image/webp;base64,${webp.toString("base64")}`;
  } catch {
    return undefined;
  }
}

export function blurDataUrl(url?: string | null): Promise<string | undefined> {
  if (!url) return Promise.resolve(undefined);

  let pending = placeholders.get(url);

  if (!pending) {
    pending = render(url);
    placeholders.set(url, pending);
  }

  return pending;
}

/** One pass over a catalogue, so a page pays for each upload once. */
export async function blurDataUrls(urls: (string | null | undefined)[]) {
  const unique = Array.from(new Set(urls.filter((url): url is string => Boolean(url))));

  const entries = await Promise.all(
    unique.map(async (url) => [url, await blurDataUrl(url)] as const),
  );

  return new Map(entries);
}
