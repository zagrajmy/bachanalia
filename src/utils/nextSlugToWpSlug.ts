const WP_PATHINFO_PREFIX = "/index.php";

export const nextSlugToWpSlug = (nextSlug?: string[] | string) => {
  const slug = Array.isArray(nextSlug) ? nextSlug.join("/") : (nextSlug ?? "/");

  if (!slug || slug === "/") return "/";

  const path = slug.startsWith("/") ? slug : `/${slug}`;
  if (path.startsWith(`${WP_PATHINFO_PREFIX}/`)) return path;

  return `${WP_PATHINFO_PREFIX}${path.endsWith("/") ? path : `${path}/`}`;
};
