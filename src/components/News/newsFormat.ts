import { htmlToText } from "@/utils/wpHtml";

export const NEWS_PATH = "/aktualnosci/";

export type NewsEntry = {
  category?: string;
  date: string;
  dateTime: string;
  excerpt: string;
  external?: boolean;
  href: string;
  id: string;
  image?: {
    src: string;
    alt: string;
    blurDataURL?: string;
    width?: number;
    height?: number;
  };
  title: string;
};

const dateFormat = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export { decodeEntities } from "@/utils/wpHtml";

const EXCERPT_CHARS = 190;

export function newsExcerpt(html?: string | null, maxChars = EXCERPT_CHARS) {
  const text = htmlToText(html);

  if (!text) return "";
  if (text.length <= maxChars) return text;

  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  const clipped = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;

  return `${clipped.replace(/[\s.,;:–—-]+$/, "")}…`;
}

export function toNewsDate(published?: Date) {
  return published
    ? { date: dateFormat.format(published), dateTime: published.toISOString() }
    : { date: "", dateTime: "" };
}
