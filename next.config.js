/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_WORDPRESS_API_HOSTNAME,
        port: "",
      },
    ],
  },
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
    ];
  },
};

module.exports = nextConfig;
