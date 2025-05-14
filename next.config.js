/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.secilstore.com'],
  },

  transpilePackages: ['react-dnd', 'react-dnd-html5-backend', 'dnd-core'],

  async rewrites() {
    return [
      {
        source: '/api/secil/:path*',
        destination: 'https://maestro-api-dev.secil.biz/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 