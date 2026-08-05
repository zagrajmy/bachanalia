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
    ],
  },
  /** WordPress is slow and rate-limits bursts; 60s is not enough to retry through it. */
  staticPageGenerationTimeout: 240,
  experimental: {
    cpus: 2,
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
      /**
       * Paynow posts its payment notification to whatever single address is
       * typed into the merchant panel, and that address is the apex. Left
       * behind at cutover it would reach this app, which has no idea what to
       * do with it: the buyer pays, the order never leaves pending, and no
       * ticket is issued. Nothing anywhere reports an error.
       *
       * The panel field is the real fix — this is the net under it. 307 rather
       * than 308 because the notification is a POST and only a 307 carries the
       * body across.
       */
      {
        source: "/",
        has: [{ type: "query", key: "wc-api" }],
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/`,
        permanent: false,
      },
      /** Bookmarked directly often enough to be worth its own rule. */
      {
        source: "/wp-login.php",
        destination: `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-login.php`,
        permanent: false,
      },
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
