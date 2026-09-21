import { decodeEntities } from "./newsFormat";

const META_TAG = /<meta\b[^>]*>/gi;
const ATTRIBUTE = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
const FACEBOOK_IMAGE_HOST = /(?:^|\.)fbcdn\.net$/;

function attributes(tag: string) {
  return new Map(
    Array.from(tag.matchAll(ATTRIBUTE), ([, name, doubleQuoted, singleQuoted, unquoted]) => [
      name!.toLowerCase(),
      doubleQuoted ?? singleQuoted ?? unquoted ?? "",
    ]),
  );
}

/** Extracts the stable image candidate exposed on a public Facebook post page. */
export function facebookOpenGraphImage(html: string) {
  for (const tag of html.match(META_TAG) ?? []) {
    const attrs = attributes(tag);
    if (attrs.get("property") !== "og:image") continue;

    const content = attrs.get("content");
    if (!content) return undefined;

    try {
      const url = new URL(decodeEntities(content));
      return url.protocol === "https:" && FACEBOOK_IMAGE_HOST.test(url.hostname)
        ? url.toString()
        : undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
}
