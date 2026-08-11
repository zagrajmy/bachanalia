import { fetchLqipWebp } from "./lqipEncode";
import { lqipForWpUrl, webpToDataUrl } from "./lqip";

const placeholders = new Map<string, Promise<string | undefined>>();

async function render(url: string) {
  try {
    const encoded = await fetchLqipWebp(url);
    return encoded ? webpToDataUrl(encoded.webp) : undefined;
  } catch {
    return undefined;
  }
}

export async function blurDataUrl(url?: string | null): Promise<string | undefined> {
  if (!url) return undefined;

  const cached = lqipForWpUrl(url);
  if (cached) return cached;

  let pending = placeholders.get(url);

  if (!pending) {
    pending = render(url);
    placeholders.set(url, pending);
  }

  return pending;
}

export async function blurDataUrls(urls: (string | null | undefined)[]) {
  const unique = [...new Set(urls.flatMap((url) => (url ? [url] : [])))];

  const entries = await Promise.all(
    unique.map(async (url) => [url, await blurDataUrl(url)] as const),
  );

  return new Map(entries);
}
