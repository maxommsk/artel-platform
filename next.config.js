/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Добавляем fallback для проблемных модулей
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'next/dist/compiled/ws': false,
      'next/dist/compiled/edge-runtime': false
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
};

module.exports = nextConfig;

