/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  // Avoid build-time network calls for fonts
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
