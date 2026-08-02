import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    /**
     * The cart is `force-dynamic` and opens a WooCommerce session on every
     * request, so a crawler walking it costs one session per hit.
     */
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/sklep/koszyk/"] },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  };
}
