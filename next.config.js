/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  /**
   * Next allows one dev server per output directory, and the e2e server runs
   * with WordPress mocked while a hand-driven `bun run dev` is usually already
   * up. Pointing the two at different directories lets them coexist, and keeps
   * the dev fetch cache of a mocked run from leaking into a live one.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    /**
     * An upload never changes under its own URL — WordPress writes a new
     * filename instead — so every variant can be fetched from that server
     * exactly once and served from the CDN forever after. Wordfence
     * rate-limits bursts, and the default 60s TTL would re-fetch all of them
     * every minute.
     */
    minimumCacheTTL: 31_536_000,
    /** Fewer breakpoints, fewer cold fetches. The widest column is 1152px. */
    deviceSizes: [384, 640, 828, 1200, 1920],
    imageSizes: [128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME,
        port: "",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        pathname: "/thumbnail",
      },
    ],
  },
  /** WordPress is slow and rate-limits bursts; 60s is not enough to retry through it. */
  staticPageGenerationTimeout: 240,
  experimental: {
    cpus: 2,
  },
  /**
   * Paynow posts its payment notification to whatever single address is typed
   * into the merchant panel, and that address is the apex. Left behind at
   * cutover it arrives here, and this app has nothing to answer it with: the
   * buyer pays, the order never leaves pending, no ticket is issued, and
   * nothing anywhere reports an error.
   *
   * Proxied rather than redirected, because a redirect is not something the
   * notification survives. Paynow wants `200 OK` or `202 Accepted` back and
   * documents nothing about following a 3xx, and the plugin authenticates the
   * message by HMAC over the raw body with no IP check at all — so what has to
   * arrive intact is the POST, the byte-exact body, the `Signature` header and
   * the `wc-api` parameter. A proxy carries all four and hands Paynow whatever
   * WordPress answered; a redirect hands it a 307 and hopes.
   *
   * Changing the panel field is still the fix. This only means a forgotten
   * field costs nobody their ticket.
   *
   * InPost's shipment-status webhook is the same shape of problem: Manager
   * Paczek holds one URL, today the apex
   * (`/wp-json/inpost_pl/v1/order/update/`), and ShipX has no API to move it.
   * Proxy it so a forgotten Manager Paczek update only costs live status
   * colours until someone pastes the `wp.` URL — labels and checkout keep
   * working either way. Geowidget's token is bound to a site URL and cannot
   * be papered over here; that one needs Manager Paczek.
   */
  async rewrites() {
    return {
      /**
       * `beforeFiles`, because the plain array form runs as `afterFiles` and
       * the front page is a file. Next would answer the notification from the
       * static route and the rewrite would never be consulted — a POST to `/`
       * comes back 405 with `x-matched-path: /`, which is what this looked
       * like before the phased form went in.
       */
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "query", key: "wc-api" }],
          destination: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/`,
        },
        {
          source: "/wp-json/inpost_pl/:path*",
          destination: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-json/inpost_pl/:path*`,
        },
      ],
    };
  },
  async redirects() {
    return [
      /**
       * Where Paynow returns a buyer, and where their ticket lives: Event
       * Tickets issues it after payment and serves it from wp-content, and no
       * guest order can be read back over GraphQL — not even by the session
       * that placed it. So this one path stays WordPress's after cutover, key
       * and all, rather than being rebuilt without the thing it delivers.
       */
      {
        source: "/zamowienie/order-received/:path*",
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/index.php/zamowienie/order-received/:path*`,
        permanent: false,
      },
      /**
       * The paths WordPress keeps serving after the apex becomes this app.
       * Uploads are the reason: every image and PDF ever placed in a post body
       * carries an absolute URL, and those URLs are also in ticket emails
       * already sent, in Facebook posts, and in Google's index — none of which
       * a database search-replace can reach.
       *
       * Never deploy these while NEXT_PUBLIC_WORDPRESS_API_URL still names the
       * apex *and* the apex already resolves here: destination would equal
       * source and every upload would redirect to itself. The cutover changes
       * the variable first for that reason.
       */
      ...["wp-content", "wp-includes", "wp-admin"].map((prefix) => ({
        source: `/${prefix}/:path*`,
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/${prefix}/:path*`,
        permanent: false,
      })),
      /** Bookmarked directly often enough to be worth its own rule. */
      {
        source: "/wp-login.php",
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-login.php`,
        permanent: false,
      },
      /** The former exhibitor pages are one directory now, including indexed PATHINFO URLs. */
      ...[
        "/poznaj-wystawcow",
        "/zgloszenia-wystawcow",
        "/index.php/poznaj-wystawcow",
        "/index.php/zgloszenia-wystawcow",
      ].map((source) => ({
        source,
        destination: "/wystawcy/",
        permanent: true,
      })),
      /**
       * WordPress numbered the second exhibitor-rules page rather than replace
       * the first, and the numbered one is the one it kept updating. The rules
       * live under the unsuffixed slug here, where the links already point.
       */
      ...["/regulamin-wystawcow-2", "/index.php/regulamin-wystawcow-2"].map((source) => ({
        source,
        destination: "/regulamin-wystawcow/",
        permanent: true,
      })),
      {
        source: "/index.php/:path*",
        destination: "/:path*/",
        permanent: true,
      },
      /** Biletomat sold these once; the shop does now. */
      {
        source: "/akredytacja",
        destination: "/sklep/",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/aktualnosci/",
        permanent: true,
      },
      {
        source: "/category/:slug*",
        destination: "/aktualnosci/",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
