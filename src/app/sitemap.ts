import { MetadataRoute } from "next";
import { print } from "graphql/language/printer";

import { NEWS_PATH } from "@/components/News/news";
import { productPath, SHOP_PATH } from "@/components/Globals/siteNav";
import { fetchProductSlugs } from "@/components/Shop/products";
import { AllContentQuery } from "@/queries/general/AllContentQuery";
import { fetchGraphQL } from "@/utils/fetchGraphQL";
import { wpUriToPath } from "@/utils/wpUriToPath";

export const revalidate = 3600;

/**
 * Routes without a WordPress URI of their own: the homepage, and the three
 * listings we assemble here. `goscie` and `sklep` exist as WP pages but their
 * `uri` is null, so they never come out of AllContentQuery.
 */
const ownRoutes = ["/", SHOP_PATH, NEWS_PATH, "/goscie/"];

/**
 * WordPress still holds pages we do not want indexed under this domain: the
 * WooCommerce transactional four, which stay on WordPress; a redirect source;
 * a duplicate; and two abandoned drafts that never left the CMS.
 */
const excluded = new Set([
  "/akredytacja/",
  "/blog/",
  "/design/",
  "/feed-test/",
  "/info/",
  "/koszyk/",
  "/moje-konto/",
  "/regulamin-wystawcow-2/",
  "/zamowienie/",
  "/zwroty/",
]);

export function sitemapPaths(uris: (string | null | undefined)[], productSlugs: string[]) {
  const paths = new Set([...ownRoutes, ...productSlugs.map(productPath), ...uris.map(wpUriToPath)]);

  return Array.from(paths).filter((path) => !excluded.has(path));
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
