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
