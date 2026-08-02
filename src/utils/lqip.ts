import cache from "@/content/lqip-cache.json";

const entries = cache as { [key: string]: string };

/** Size variants of the same upload share one LQIP. */
export function wpMediaKey(url: string) {
  try {
    return new URL(url).pathname
      .replace(/-\d+x\d+(?=\.[^.]+$)/, "")
      .replace(/-scaled(?=\.[^.]+$)/, "");
  } catch {
    return url;
  }
}

export function fbPostKey(postId: string) {
  return `fb:${postId}`;
}

export function lqip(key?: string | null) {
  if (!key) return undefined;
  return entries[key];
}

export function lqipForWpUrl(url?: string | null) {
  if (!url) return undefined;
  return lqip(wpMediaKey(url));
}
