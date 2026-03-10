/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["hive-data-prod-cdn.thehive.ai"],
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Apply COEP/COOP to ALL routes — required for WebContainer (SharedArrayBuffer)
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
