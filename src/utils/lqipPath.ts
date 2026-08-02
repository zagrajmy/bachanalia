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

/** Relative path under `src/content/lqip/` for a cache key. */
export function lqipRelPath(key: string) {
  if (key.startsWith("fb:")) return `fb/${key.slice(3)}.webp`;

  const path = key.startsWith("/") ? key.slice(1) : key;
  return path.replace(/\.[^.]+$/, ".webp");
}

export function lqipMetaRelPath(key: string) {
  return lqipRelPath(key).replace(/\.webp$/, ".json");
}
