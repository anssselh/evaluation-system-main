/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Required for Next.js 16 (Turbopack is default)
  turbopack: {},
};

export default nextConfig;
