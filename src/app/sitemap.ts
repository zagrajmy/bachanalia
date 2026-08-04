import { MetadataRoute } from "next";
import { print } from "graphql/language/printer";

import { NEWS_PATH } from "@/components/News/news";
import { productPath, RETIRED_PATHS, SHOP_PATH } from "@/components/Globals/siteNav";
import { fetchProductSlugs } from "@/components/Shop/products";
import { AllContentQuery } from "@/queries/general/AllContentQuery";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { wpUriToPath } from "@/utils/wpUriToPath";

export const revalidate = 10_800;

/**
 * Routes without a WordPress URI of their own: the homepage, and the three
 * listings we assemble here. `goscie` and `sklep` exist as WP pages but their
 * `uri` is null, so they never come out of AllContentQuery.
 */
const ownRoutes = ["/", SHOP_PATH, NEWS_PATH, "/goscie/"];

/**
 * On top of the pages we do not serve at all — which already covers the four
 * WooCommerce transactional pages — two redirect sources.
 */
const excluded = new Set(["/akredytacja/", "/blog/", ...RETIRED_PATHS]);

export function sitemapPaths(uris: (string | null | undefined)[], productSlugs: string[]) {
  const paths = new Set([...ownRoutes, ...productSlugs.map(productPath), ...uris.map(wpUriToPath)]);

  return [...paths].filter((path) => !excluded.has(path));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [content, productSlugs] = await Promise.all([
    fetchGraphQL<{
      pages: { nodes: { uri?: string | null }[] };
      posts: { nodes: { uri?: string | null }[] };
    }>(print(AllContentQuery)),
    fetchProductSlugs(),
  ]);

  const uris = [...(content.pages?.nodes ?? []), ...(content.posts?.nodes ?? [])].map(
    (node) => node.uri,
  );

  return sitemapPaths(uris, productSlugs).map((path) => ({
    url: `${process.env.NEXT_PUBLIC_BASE_URL}${path}`,
  }));
}
