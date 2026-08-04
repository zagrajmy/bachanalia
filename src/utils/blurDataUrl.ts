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

export function blurDataUrl(url?: string | null): Promise<string | undefined> {
  if (!url) return Promise.resolve(undefined);

  const cached = lqipForWpUrl(url);
  if (cached) return Promise.resolve(cached);

  let pending = placeholders.get(url);

  if (!pending) {
    pending = render(url);
    placeholders.set(url, pending);
  }

  return pending;
}

export async function blurDataUrls(urls: (string | null | undefined)[]) {
  const unique = [...new Set(urls.filter((url): url is string => Boolean(url)))];

  const entries = await Promise.all(
    unique.map(async (url) => [url, await blurDataUrl(url)] as const),
  );

  return new Map(entries);
}
