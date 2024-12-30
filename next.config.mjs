/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["hive-data-prod-cdn.thehive.ai"],
    unoptimized: true,
  },
};

export default nextConfig;
