export const nextSlugToWpSlug = (nextSlug?: string[] | string) =>
  Array.isArray(nextSlug) ? nextSlug.join("/") : (nextSlug ?? "/");
