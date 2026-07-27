const DROPPED_ATTRIBUTES = [
  / role="region"(?= aria-roledescription="carousel")/g,
  / aria-roledescription="(?:carousel|slide)"/g,
  / aria-label="Karuzela obrazków"/g,
  / aria-label="\d+ z \d+"/g,
  / aria-live="off"/g,
  /(?<=<div class="swiper-slide") role="group"/g,
];

export const prepareWpContent = (html?: string | null) =>
  DROPPED_ATTRIBUTES.reduce<string>((acc, pattern) => acc.replace(pattern, ""), html ?? "");

const MEDIA = /<(?:img|iframe|video|audio|picture|svg)\b/i;

export const hasVisibleContent = (html?: string | null) => {
  if (!html) return false;
  if (MEDIA.test(html)) return true;

  return (
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim().length > 0
  );
};
