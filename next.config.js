/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
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
      {
        source: "/index.php/:path*",
        destination: "/:path*/",
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
