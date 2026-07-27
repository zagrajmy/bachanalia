const WP_PATHINFO_PREFIX = "/index.php";

export const wpUriToPath = (uri?: string | null) => {
  if (!uri) return "/";

  const path = uri.startsWith(WP_PATHINFO_PREFIX) ? uri.slice(WP_PATHINFO_PREFIX.length) : uri;

  if (!path || path === "/") return "/";

  return path.endsWith("/") ? path : `${path}/`;
};
