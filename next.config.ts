/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Add your image host
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/socket",
        destination: "/api/socket",
      },
    ];
  },
};

module.exports = nextConfig;
